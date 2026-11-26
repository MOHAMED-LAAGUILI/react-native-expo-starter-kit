#!/usr/bin/env node
/// <reference types="node" />
/**
 * Fails when Jest silently skips test files.
 *
 * A wrong `testMatch`, `roots` or project glob does not make Jest fail — it
 * just runs fewer tests and reports green. This compares the `*.test.ts(x)`
 * files on disk under __tests__/ with what `jest --listTests` would run, and
 * fails on any file Jest would not pick up (or when it finds none at all).
 *
 * Usage: node script/check-jest-discovery.ts
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const TESTS_DIR = path.join(ROOT, '__tests__')
const TEST_FILE = /\.test\.tsx?$/

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir))
    return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      walk(full, out)
    else if (TEST_FILE.test(entry.name))
      out.push(full)
  }
  return out
}

const normalize = (file: string) => path.resolve(file).replace(/\\/g, '/').toLowerCase()

const onDisk = walk(TESTS_DIR)
const jestBin = path.join(ROOT, 'node_modules', 'jest', 'bin', 'jest.js')
const result = spawnSync(process.execPath, [jestBin, '--listTests', '--json', '--watchman=false'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
})

if (result.status !== 0) {
  console.error(result.stderr || result.stdout)
  console.error('✖ `jest --listTests` failed.')
  process.exit(1)
}

/** `jest --listTests --json` prints a JSON array of paths; anything else is a broken run, not "no tests". */
function parseListedTests(stdout: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(stdout.trim() || '[]')
  }
  catch {
    console.error(stdout)
    console.error('✖ `jest --listTests --json` did not print valid JSON.')
    process.exit(1)
  }
  if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
    console.error('✖ `jest --listTests --json` returned an unexpected shape (expected an array of file paths).')
    process.exit(1)
  }
  return parsed
}

const listed = new Set(parseListedTests(result.stdout).map(normalize))
const missed = onDisk.filter(file => !listed.has(normalize(file)))

if (listed.size === 0) {
  console.error('✖ Jest found no tests at all — check testMatch / projects in jest.config.js.')
  process.exit(1)
}
if (missed.length > 0) {
  for (const file of missed)
    console.error(`✖ not discovered: ${path.relative(ROOT, file)}`)
  console.error(`\n${missed.length} test file(s) on disk are not matched by any Jest project. Fix the file location/extension or testMatch.`)
  process.exit(1)
}
console.log(`✔ Jest discovers all ${onDisk.length} test file(s) under __tests__/.`)
