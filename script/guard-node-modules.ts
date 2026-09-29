#!/usr/bin/env node
/// <reference types="node" />
/**
 * Pre-install guard: refuses to let pnpm rewrite node_modules while something
 * else is using it, and clears the locks that are safe to clear.
 *
 * On Windows a file that another process has open cannot be deleted, so an
 * install that runs alongside Metro, a Gradle build or a second pnpm dies
 * half-way with EBUSY / ENOTEMPTY and leaves node_modules broken (missing .bin
 * links, duplicate native modules). This runs as `pnpm:devPreinstall` — before
 * pnpm touches node_modules — so it covers `pnpm install`, `pnpm add` and
 * `expo install --fix` (which shells out to `pnpm add`).
 *
 * Stops the install (exit 1) when:
 *   - another pnpm install/add/remove/update is running
 *   - this project's Metro (`expo start`) or `expo run:*` is running
 *   - a Gradle build is in progress
 * Clears automatically:
 *   - idle Gradle / Kotlin daemons (they hold jars under node_modules)
 *   - Watchman's watch on this project (Metro re-adds it on next start)
 *
 * Skipped in CI / EAS builds, or with SKIP_INSTALL_GUARD=1.
 *
 * Usage: node script/guard-node-modules.ts
 */

import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

type Proc = { pid: number, ppid: number, name: string, cmd: string }

type Row = { ProcessId: number, ParentProcessId: number, Name: string | null, CommandLine: string | null }

const ROOT = process.cwd()
const IS_WINDOWS = process.platform === 'win32'

if (process.env.CI || process.env.EAS_BUILD || process.env.SKIP_INSTALL_GUARD === '1')
  process.exit(0)

/** Normalise a path for substring matching against command lines. */
function norm(p: string): string {
  return p.replaceAll('\\', '/').toLowerCase()
}

function listProcesses(): Proc[] {
  try {
    if (IS_WINDOWS) {
      const json = execFileSync('powershell', [
        '-NoProfile',
        '-Command',
        'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress',
      ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      const parsed = JSON.parse(json) as Row | Row[]
      const rows = Array.isArray(parsed) ? parsed : [parsed]
      return rows.map(r => ({ pid: r.ProcessId, ppid: r.ParentProcessId, name: r.Name ?? '', cmd: r.CommandLine ?? '' }))
    }
    const out = execFileSync('ps', ['-Ao', 'pid=,ppid=,comm=,args='], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    return out.split('\n').filter(Boolean).map((line) => {
      const [pid, ppid, name, ...args] = line.trim().split(/\s+/)
      return { pid: Number(pid), ppid: Number(ppid), name: path.basename(name ?? ''), cmd: args.join(' ') }
    })
  }
  catch {
    // Can't inspect processes — don't block the install over it.
    console.warn('[install-guard] Could not list processes; skipping checks.')
    return []
  }
}

/** PIDs of this process and everything that launched it (the pnpm running us). */
function ancestorPids(procs: Proc[]): Set<number> {
  const byPid = new Map(procs.map(p => [p.pid, p]))
  const seen = new Set<number>()
  let pid: number | undefined = process.pid
  while (pid && !seen.has(pid)) {
    seen.add(pid)
    pid = byPid.get(pid)?.ppid
  }
  return seen
}

const procs = listProcesses()
const mine = ancestorPids(procs)
const others = procs.filter(p => !mine.has(p.pid))
const root = norm(ROOT)

// Match on the runtime itself, not on shells whose command text merely mentions
// one of these commands.
const isNode = (p: Proc) => /^(node|pnpm)(.exe)?$/i.test(p.name)
const isJava = (p: Proc) => /^java(w)?(.exe)?$/i.test(p.name)

/** Keep reported command lines readable. */
function short(cmd: string): string {
  const trimmed = cmd.trim()
  return trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed
}

const problems: string[] = []

// 1. Another pnpm mutating node_modules. The command line doesn't say which
//    project it's in, so this errs on the side of stopping.
const pnpmRuns = others.filter(p =>
  isNode(p)
  && /pnpm(\.cjs|\.js|\.exe)?["']?\s/i.test(p.cmd)
  && /\s["']?(install|i|add|remove|rm|update|up)["']?(\s|$)/i.test(p.cmd),
)
for (const p of pnpmRuns)
  problems.push(`another pnpm is running (PID ${p.pid}): ${short(p.cmd)}`)

// 2. This project's dev server or native run — it holds files open and Metro
//    re-adds the Watchman watch.
const expoRuns = others.filter((p) => {
  if (!isNode(p))
    return false
  const cmd = norm(p.cmd)
  return cmd.includes(root) && /expo[/\\]bin[/\\]cli["']?\s+(start|run:)/i.test(p.cmd)
})
for (const p of expoRuns)
  problems.push(`this project's Expo is running (PID ${p.pid}): ${short(p.cmd)}`)

// 3. Gradle. An active build must not be interrupted; idle daemons are fair game.
const gradleBuilds = others.filter(p => isJava(p) && /GradleWrapperMain|org\.gradle\.launcher\.GradleMain/.test(p.cmd))
for (const p of gradleBuilds)
  problems.push(`a Gradle build is running (PID ${p.pid}) — wait for it to finish`)

if (problems.length > 0) {
  console.error('\n[install-guard] Refusing to modify node_modules while it is in use:\n')
  for (const problem of problems)
    console.error(`  - ${problem}`)
  console.error('\nStop the above, then re-run. (Override: SKIP_INSTALL_GUARD=1)\n')
  process.exit(1)
}

// Safe to clear from here on.

const gradleDaemons = others.filter(p => isJava(p) && /GradleDaemon/.test(p.cmd))
const kotlinDaemons = others.filter(p => isJava(p) && /KotlinCompileDaemon/.test(p.cmd))

if (gradleDaemons.length > 0) {
  const wrapper = path.join(ROOT, 'android', IS_WINDOWS ? 'gradlew.bat' : 'gradlew')
  if (fs.existsSync(wrapper)) {
    console.log(`[install-guard] Stopping ${gradleDaemons.length} idle Gradle daemon(s)…`)
    spawnSync(IS_WINDOWS ? `"${wrapper}"` : wrapper, ['-p', 'android', '--stop', '--quiet'], { stdio: 'inherit', shell: IS_WINDOWS })
  }
}

for (const p of kotlinDaemons) {
  try {
    process.kill(p.pid)
    console.log(`[install-guard] Stopped idle Kotlin daemon (PID ${p.pid}).`)
  }
  catch {}
}

// Watchman on Windows keeps directory handles open, which makes pnpm's rmdir
// fail with ENOTEMPTY. Metro re-adds the watch when it next starts.
const watchman = spawnSync('watchman', ['watch-del', ROOT], { encoding: 'utf8' })
if (watchman.status === 0 && watchman.stdout.includes('"watch-del": true'))
  console.log('[install-guard] Removed Watchman watch on this project.')
