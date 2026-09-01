#!/usr/bin/env node
/// <reference types="node" />
/**
 * Installs the skills pinned in skills-lock.json into .claude/skills/.
 *
 * Two sources, in order of preference:
 *   1. autoskills' local cache (~/.cache/autoskills/skills-registry/<computedHash>/).
 *      The lockfile hash IS the cache key, so a hit is the exact pinned revision.
 *   2. raw.githubusercontent.com, for entries with sourceType "github".
 *      Correct source and path, but the revision is NOT verifiable — the lockfile's
 *      computedHash is not a plain sha256 of the file, so we cannot check it.
 *
 * Deliberately does not shell out to `npx autoskills`: that re-detects skills from
 * the dependency tree and installs globally to ~/.agents/skills/, which is a
 * different set in a different place. The lockfile is the source of truth.
 *
 * Runs straight through node — no build step, no ts-node. Node strips the types
 * itself, which needs Node >= 22.18 (see the `engines` field in package.json).
 *
 * Usage: node script/install-skills.ts [--dry-run]
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

type SkillEntry = {
  computedHash: string
  skillPath: string
  source: string
  sourceType: string
}

type Lockfile = {
  skills?: Record<string, SkillEntry>
}

const DRY_RUN = process.argv.includes('--dry-run')
const ROOT = process.cwd()
const LOCKFILE = path.join(ROOT, 'skills-lock.json')
const DEST = path.join(ROOT, '.claude', 'skills')
const CACHE = path.join(os.homedir(), '.cache', 'autoskills', 'skills-registry')

if (!fs.existsSync(LOCKFILE)) {
  console.error('skills-lock.json not found — run this from the project root.')
  process.exit(1)
}

const lock = JSON.parse(fs.readFileSync(LOCKFILE, 'utf8')) as Lockfile
const entries = Object.entries(lock.skills ?? {})

if (entries.length === 0) {
  console.error('skills-lock.json lists no skills.')
  process.exit(1)
}

/** A cache entry is <hash>/<skill-name>/…; unwrap that single wrapper directory. */
function resolveCacheDir(hash: string): string | null {
  const hashDir = path.join(CACHE, hash)
  if (!fs.existsSync(hashDir))
    return null
  const inner = fs.readdirSync(hashDir)
  return inner.length === 1 && fs.statSync(path.join(hashDir, inner[0])).isDirectory()
    ? path.join(hashDir, inner[0])
    : hashDir
}

async function fetchFromGithub(entry: SkillEntry): Promise<string> {
  const url = `https://raw.githubusercontent.com/${entry.source}/main/${entry.skillPath}`
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

const  fromCache: string[] = []
const fromNetwork: string[] = []
const failed: string[] = []

for (const [name, entry] of entries) {
  const target = path.join(DEST, name)
  const cacheDir = resolveCacheDir(entry.computedHash)

  if (cacheDir) {
    if (!DRY_RUN) {
      fs.mkdirSync(DEST, { recursive: true })
      fs.rmSync(target, { force: true, recursive: true })
      fs.cpSync(cacheDir, target, { recursive: true })
    }
    fromCache.push(name)
    continue
  }

  if (entry.sourceType !== 'github') {
    failed.push(`${name} — not cached, and sourceType "${entry.sourceType}" has no download path`)
    continue
  }

  try {
    const body = await fetchFromGithub(entry)
    if (!DRY_RUN) {
      fs.mkdirSync(target, { recursive: true })
      fs.writeFileSync(path.join(target, 'SKILL.md'), body)
    }
    fromNetwork.push(name)
  }
  catch (error) {
    failed.push(`${name} — ${error instanceof Error ? error.message : String(error)}`)
  }
}

const label = DRY_RUN ? 'would install' : 'installed'
console.log(`\nSkills ${label}: ${fromCache.length + fromNetwork.length}/${entries.length}\n`)
console.log(`  ${fromCache.length} from autoskills cache (exact pinned revision)`)
console.log(`  ${fromNetwork.length} from GitHub (revision NOT verifiable — see .claude/README.md)`)

if (fromNetwork.length > 0)
  console.log(`    ${fromNetwork.join(', ')}`)

if (failed.length > 0) {
  console.error(`\n  ${failed.length} failed:`)
  for (const line of failed) console.error(`    ${line}`)
  console.error('\nA cache miss plus no network leaves these unavailable. Re-run when online.')
  process.exit(1)
}

console.log(DRY_RUN ? '\n--dry-run: nothing was written.' : `\nWrote to ${path.relative(ROOT, DEST)}/`)
