#!/usr/bin/env node
/// <reference types="node" />
/**
 * One dependency health report:
 *
 *   1. Expo SDK alignment   `expo install --check` — SDK-managed packages must
 *                           match the installed SDK (fix: `pnpm run deps:fix`).
 *   2. Outdated             `pnpm outdated`, split into SDK-managed packages
 *                           (only move with `pnpm run upgrade:expo`) and the
 *                           rest (safe to bump yourself, majors flagged).
 *   3. Unused / unlisted    knip — dependencies nothing imports, and imports
 *                           that aren't declared in package.json.
 *   4. Duplicates           more than one copy of react / react-native /
 *                           reanimated / … in node_modules (breaks at runtime).
 *   5. Alternatives         lighter or better-maintained options for heavy or
 *                           overlapping packages (script/lib/dependency-alternatives.ts).
 *
 * Usage: node script/check-deps.ts [--strict] [--skip-outdated] [--skip-unused]
 *   --strict  exit 1 on SDK misalignment, duplicates or unlisted imports (CI gate)
 *
 * In GitHub Actions the report is also written to the job summary.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { ALTERNATIVES } from './lib/dependency-alternatives.ts'
import { checkAlignment as expoAlignment } from './lib/expo-alignment.ts'
import { spawn } from './lib/spawn.ts'

type Outdated = Record<string, { current: string, latest: string, wanted: string, dependencyType: string }>

const ROOT = process.cwd()
const args = new Set(process.argv.slice(2))
const STRICT = args.has('--strict')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const declared: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies }
const lines: string[] = []
let problems = 0

function out(line = ''): void {
  lines.push(line)
  console.log(line)
}

function run(command: string, commandArgs: string[]) {
  return spawn(command, commandArgs, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  }
  catch {
    return null
  }
}

const expoCli = path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli')
if (!fs.existsSync(expoCli)) {
  console.error('✖ node_modules is missing or incomplete — run `pnpm run install:safe` first.')
  process.exit(1)
}

/** Packages whose version the Expo SDK decides (plus the SDK itself). */
const sdkManaged = new Set([
  'expo',
  ...Object.keys(readJson<Record<string, string>>(path.join(ROOT, 'node_modules', 'expo', 'bundledNativeModules.json')) ?? {}),
])

function checkAlignment(): void {
  out('## 1. Expo SDK alignment')
  const alignment = expoAlignment()
  if (alignment.ok) {
    out('✔ SDK-managed packages match the installed Expo SDK')
  }
  else if (alignment.tooNew.length === alignment.misaligned.length && alignment.misaligned.length > 0) {
    // Every target is younger than pnpm's minimumReleaseAge: waiting is correct.
    const days = alignment.minimumReleaseAgeMinutes / 1440
    out(`⚠ Expo has newer SDK patches, but they are younger than minimumReleaseAge (${days} d) — waiting:`)
    for (const p of alignment.tooNew)
      out(`  ${p.name.padEnd(36)} ${p.current} → ${p.expected}  (installable in ~${Math.max(0, days - p.ageDays).toFixed(1)} d)`)
  }
  else {
    problems++
    out('✖ Packages do not match the installed SDK:')
    for (const p of alignment.misaligned)
      out(`  ${p.name.padEnd(36)} ${p.current} → ${p.expected}`)
    out('→ `pnpm run deps:fix`')
  }
  out()
}

function checkOutdated(): void {
  out('## 2. Outdated packages')
  const result = run('pnpm', ['outdated', '--format', 'json'])
  const report = (() => {
    try {
      // pnpm writes registry retry warnings (" WARN  GET … ERR_SOCKET_TIMEOUT") to
      // stdout ahead of the JSON; keep only the JSON body.
      const json = (result.stdout || '').split(/\r?\n/).filter(line => !/^\s*(?:WARN|ERR_PNPM)\b/.test(line)).join('\n')
      return JSON.parse(json.trim() || '{}') as Outdated
    }
    catch {
      return null
    }
  })()
  if (!report) {
    out(`⚠ could not read \`pnpm outdated\`: ${(result.stderr || '').trim().split('\n')[0]}`)
    out()
    return
  }
  const entries = Object.entries(report)
  if (entries.length === 0) {
    out('✔ everything is on its latest version')
    out()
    return
  }
  const isMajor = (a: string, b: string) => a.split('.')[0].replace(/\D/g, '') !== b.split('.')[0].replace(/\D/g, '')
  const managed = entries.filter(([name]) => sdkManaged.has(name))
  const free = entries.filter(([name]) => !sdkManaged.has(name))
  if (managed.length) {
    out(`SDK-managed (${managed.length}) — upgrade only with \`pnpm run upgrade:expo\`:`)
    for (const [name, v] of managed)
      out(`  ${name.padEnd(44)} ${v.current.padEnd(12)} → ${v.latest}`)
  }
  if (free.length) {
    out(`Other packages (${free.length}):`)
    for (const [name, v] of free)
      out(`  ${isMajor(v.current, v.latest) ? 'MAJOR' : '     '} ${name.padEnd(38)} ${v.current.padEnd(12)} → ${v.latest}`)
    out('→ minors/patches: `pnpm update <pkg>`; majors: read the changelog first, then `pnpm add <pkg>@latest` and `pnpm run checks`')
  }
  out()
}

function checkUnused(): void {
  out('## 3. Unused & unlisted dependencies (knip)')
  const knipBin = path.join(ROOT, 'node_modules', 'knip', 'bin', 'knip.js')
  if (!fs.existsSync(knipBin)) {
    out('⚠ knip is not installed — skipped')
    out()
    return
  }
  const result = run(process.execPath, [knipBin, '--include', 'dependencies,unlisted,binaries', '--reporter', 'json', '--no-progress'])
  type KnipIssue = { file: string, dependencies?: { name: string }[], devDependencies?: { name: string }[], unlisted?: { name: string }[], binaries?: { name: string }[] }
  const parsed = readJsonText<{ issues?: KnipIssue[] }>(result.stdout)
  if (!parsed) {
    out(`⚠ could not read knip output: ${(result.stderr || result.stdout).trim().split('\n')[0]}`)
    out()
    return
  }
  const pick = (key: keyof KnipIssue) => (parsed.issues ?? []).flatMap(issue => ((issue[key] as { name: string }[] | undefined) ?? []).map(d => ({ name: d.name, file: issue.file })))
  const unused = [...pick('dependencies'), ...pick('devDependencies')]
  const unlisted = pick('unlisted')
  out(unused.length ? `⚠ unused (${unused.length}): ${unused.map(u => u.name).join(', ')}` : '✔ no unused dependencies')
  if (unlisted.length) {
    problems++
    out(`✖ imported but not declared (${unlisted.length}) — works only by accident of hoisting:`)
    for (const u of unlisted)
      out(`  ${u.name.padEnd(36)} in ${u.file}`)
    out('→ `pnpm exec expo install <pkg>` (Expo packages) or `pnpm add <pkg>`')
  }
  else {
    out('✔ every import is declared')
  }
  out()
}

function readJsonText<T>(text: string): T | null {
  try {
    return JSON.parse(text.slice(text.indexOf('{'))) as T
  }
  catch {
    return null
  }
}

/** Singletons: a second copy of any of these breaks hooks, native registration or context. */
const SINGLETONS = ['react', 'react-native', 'react-native-reanimated', 'react-native-worklets', 'react-native-gesture-handler', 'react-native-screens', 'react-native-safe-area-context', 'react-native-svg', 'expo-modules-core', '@react-navigation/native']

function checkDuplicates(): void {
  out('## 4. Duplicate singletons')
  const found = new Map<string, Set<string>>()
  const visit = (dir: string, depth: number) => {
    if (depth > 4 || !fs.existsSync(dir))
      return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.pnpm')
        continue
      const names = entry.name.startsWith('@')
        ? fs.readdirSync(path.join(dir, entry.name)).map(child => `${entry.name}/${child}`)
        : [entry.name]
      for (const name of names) {
        const pkgDir = path.join(dir, name)
        if (SINGLETONS.includes(name)) {
          const version = readJson<{ version: string }>(path.join(pkgDir, 'package.json'))?.version
          if (version)
            found.set(name, (found.get(name) ?? new Set()).add(version))
        }
        visit(path.join(pkgDir, 'node_modules'), depth + 1)
      }
    }
  }
  visit(path.join(ROOT, 'node_modules'), 0)
  const dupes = [...found].filter(([, versions]) => versions.size > 1)
  if (dupes.length === 0) {
    out(`✔ one copy each of ${SINGLETONS.length} singleton packages`)
  }
  else {
    problems++
    for (const [name, versions] of dupes)
      out(`✖ ${name}: ${[...versions].join(', ')}`)
    out('→ `pnpm why <pkg>`, then align with `pnpm run deps:fix` or a pnpm override; if node_modules was half-written, delete it and reinstall')
  }
  out()
}

function listAlternatives(): void {
  out('## 5. Lighter / better alternatives')
  const relevant = ALTERNATIVES.filter(a => a.pkg in declared)
  if (relevant.length === 0) {
    out('✔ none of the known heavy or overlapping packages are installed')
    return
  }
  for (const a of relevant)
    out(`- ${a.pkg} [${a.kind}, effort ${a.effort}${a.native ? ', native change' : ''}] — ${a.why}\n    → ${a.instead}`)
  out('\nMeasure before swapping: `pnpm run perf:bundle` shows what each package actually adds to the bundle.')
}

checkAlignment()
if (!args.has('--skip-outdated'))
  checkOutdated()
if (!args.has('--skip-unused'))
  checkUnused()
checkDuplicates()
listAlternatives()

if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `# Dependency report\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`)

if (STRICT && problems > 0) {
  console.error(`\n✖ ${problems} problem(s) — see above.`)
  process.exitCode = 1
}
