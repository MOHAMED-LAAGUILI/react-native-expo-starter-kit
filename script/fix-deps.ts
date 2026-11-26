#!/usr/bin/env node
/// <reference types="node" />
/**
 * `expo install --fix`, but safe to run from `pnpm run checks` and the
 * pre-commit hook.
 *
 * When Expo asks for a version younger than pnpm's `minimumReleaseAge`
 * (pnpm-workspace.yaml), `pnpm add` refuses it half-way and leaves
 * node_modules without `expo`. So: if every target is old enough, run the fix;
 * if any is too new, report when it becomes installable and change nothing.
 *
 * Usage: node script/fix-deps.ts
 */

import path from 'node:path'
import process from 'node:process'
import { checkAlignment } from './lib/expo-alignment.ts'
import { spawn } from './lib/spawn.ts'

const ROOT = process.cwd()
const alignment = checkAlignment()

if (alignment.ok) {
  console.log('✔ SDK-managed packages match the installed Expo SDK')
  process.exit(0)
}

if (alignment.tooNew.length > 0) {
  const days = alignment.minimumReleaseAgeMinutes / 1440
  console.log(`⚠ Expo wants versions published less than ${days} day(s) ago — pnpm's minimumReleaseAge will not install them yet:`)
  for (const p of alignment.tooNew) {
    const waitDays = Math.max(0, days - p.ageDays).toFixed(1)
    console.log(`  ${p.name.padEnd(36)} ${p.current} → ${p.expected}  (installable in ~${waitDays} d)`)
  }
  console.log('Skipping `expo install --fix` so node_modules stays intact. Run `pnpm run deps:fix` again once they are old enough.')
  process.exit(0)
}

console.log(`Aligning ${alignment.misaligned.length} package(s) with the installed SDK…`)
const result = spawn(process.execPath, [path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli'), 'install', '--fix'], { cwd: ROOT, stdio: 'inherit' })
process.exit(result.status ?? 1)
