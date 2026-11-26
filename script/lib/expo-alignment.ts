/// <reference types="node" />
/**
 * Which SDK-managed packages `expo install --fix` would change, and whether
 * each target version is old enough for pnpm's `minimumReleaseAge`.
 *
 * Expo publishes SDK patch releases and `expo install --check` asks for them
 * immediately; pnpm-workspace.yaml's `minimumReleaseAge` (a supply-chain
 * guard) refuses versions younger than that. Running `expo install --fix`
 * inside that window makes `pnpm add` fail half-way and leaves node_modules
 * without `expo`. Callers use `tooNew` to wait instead.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from './spawn.ts'

export type Misaligned = { name: string, current: string, expected: string }
export type Alignment = {
  ok: boolean
  misaligned: Misaligned[]
  /** Targets published less than `minimumReleaseAge` ago, with their age in days. */
  tooNew: Array<Misaligned & { ageDays: number }>
  minimumReleaseAgeMinutes: number
  raw: string
}

const ROOT = process.cwd()

/** pnpm only enforces `minimumReleaseAge` from 10.16; older versions ignore the setting. */
function pnpmEnforcesReleaseAge(): boolean {
  const version = (process.env.npm_config_user_agent?.match(/pnpm\/(\d+)\.(\d+)/) ?? spawn('pnpm', ['--version']).stdout.match(/(\d+)\.(\d+)/))
  if (!version)
    return false
  const [major, minor] = [Number(version[1]), Number(version[2])]
  return major > 10 || (major === 10 && minor >= 16)
}

export function minimumReleaseAgeMinutes(): number {
  if (!pnpmEnforcesReleaseAge())
    return 0
  try {
    const yaml = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8')
    return Number(yaml.match(/^minimumReleaseAge:\s*(\d+)/m)?.[1] ?? 0)
  }
  catch {
    return 0
  }
}

/** Publish date of the newest version matching `range` (e.g. "~58.1.0"). */
function publishedAt(name: string, range: string): { version: string, date: Date } | null {
  const result = spawn('npm', ['view', `${name}@${range}`, 'version', 'time', '--json'])
  if (result.status !== 0)
    return null
  try {
    const parsed = JSON.parse(result.stdout.trim())
    const entries: Array<{ version: string, time: Record<string, string> }> = Array.isArray(parsed) ? parsed : [parsed]
    const last = entries.at(-1)
    if (!last?.version || !last.time?.[last.version])
      return null
    return { version: last.version, date: new Date(last.time[last.version]) }
  }
  catch {
    return null
  }
}

export function checkAlignment(): Alignment {
  const cli = path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli')
  const result = spawn(process.execPath, [cli, 'install', '--check'], { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 })
  const raw = `${result.stdout}${result.stderr}`
  const misaligned = [...raw.matchAll(/^\s*(\S+)@(\S+)\s+-\s+expected version:\s+(\S+)/gm)]
    .map(m => ({ name: m[1], current: m[2], expected: m[3] }))
  const minAge = minimumReleaseAgeMinutes()
  const tooNew: Alignment['tooNew'] = []
  if (minAge > 0) {
    for (const entry of misaligned) {
      const published = publishedAt(entry.name, entry.expected)
      if (!published)
        continue
      const ageDays = (Date.now() - published.date.getTime()) / 86_400_000
      if (ageDays * 1440 < minAge)
        tooNew.push({ ...entry, expected: published.version, ageDays })
    }
  }
  return { ok: result.status === 0 && misaligned.length === 0, misaligned, tooNew, minimumReleaseAgeMinutes: minAge, raw }
}
