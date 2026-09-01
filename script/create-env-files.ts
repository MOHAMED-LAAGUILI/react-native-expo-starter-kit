#!/usr/bin/env node
/// <reference types="node" />
/**
 * Creates .env.development, .env.preview and .env.production from .env.example.
 *
 * Every key is copied verbatim — comments and blank lines included — except
 * EXPO_PUBLIC_APP_ENV, which is set to the target environment. That is the only
 * value that actually differs between the three files; anything else that needs
 * to differ is per-machine and belongs in the generated file, not the template.
 *
 * Existing files are left alone. These files are committed and may hold local
 * edits, so overwriting is opt-in via --force rather than the default.
 *
 * Usage: node script/create-env-files.ts [--force] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ENVIRONMENTS = ['development', 'preview', 'production'] as const

type Environment = (typeof ENVIRONMENTS)[number]

const APP_ENV_KEY = 'EXPO_PUBLIC_APP_ENV'

const FORCE = process.argv.includes('--force')
const DRY_RUN = process.argv.includes('--dry-run')
const ROOT = process.cwd()
const TEMPLATE = path.join(ROOT, '.env.example')

if (!fs.existsSync(TEMPLATE)) {
  console.error('.env.example not found — run this from the project root.')
  process.exit(1)
}

const raw = fs.readFileSync(TEMPLATE, 'utf8')

if (raw.trim() === '') {
  console.error('.env.example is empty — nothing to generate from.')
  process.exit(1)
}

/**
 * Mirror the template byte-for-byte where we can: its line endings (this repo is
 * developed on Windows) and whether it ends in one. Imposing our own convention
 * would make --force rewrite files whose content is already correct.
 */
const EOL = raw.includes('\r\n') ? '\r\n' : '\n'
const TRAILING_EOL = /\r?\n$/.test(raw) ? EOL : ''

/** Rewrite APP_ENV for the target environment, appending it if absent. */
function render(environment: Environment): string {
  const lines = raw.replace(/\r?\n$/, '').split(/\r?\n/)
  let replaced = false

  const body = lines.map((line) => {
    if (!line.startsWith(`${APP_ENV_KEY}=`))
      return line
    replaced = true
    return `${APP_ENV_KEY}=${environment}`
  })

  if (!replaced)
    body.push(`${APP_ENV_KEY}=${environment}`)

  return `${body.join(EOL)}${TRAILING_EOL}`
}

const written: string[] = []
const skipped: string[] = []

for (const environment of ENVIRONMENTS) {
  const name = `.env.${environment}`
  const target = path.join(ROOT, name)

  if (fs.existsSync(target) && !FORCE) {
    skipped.push(name)
    continue
  }

  if (!DRY_RUN)
    fs.writeFileSync(target, render(environment))

  written.push(name)
}

const label = DRY_RUN ? 'would write' : 'wrote'
console.log(`\nEnv files ${label}: ${written.length}/${ENVIRONMENTS.length}\n`)

if (written.length > 0)
  console.log(`  ${written.join(', ')}`)

if (skipped.length > 0) {
  console.log(`  ${skipped.length} left untouched (already exist): ${skipped.join(', ')}`)
  console.log('  Pass --force to overwrite them.')
}

if (DRY_RUN)
  console.log('\n--dry-run: nothing was written.')
