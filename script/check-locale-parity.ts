#!/usr/bin/env node
/// <reference types="node" />
/**
 * Fails when a locale drifts from the reference locale (English).
 *
 * Layout: src/i18n/locales/<lang>/<namespace>.json. Every namespace file that
 * exists for `en` must exist for every other language, and every leaf key in
 * it (nested objects flattened to dotted paths) must be present and non-empty.
 * Keys that exist only in a translation are reported too — they are dead
 * strings nobody will ever see.
 *
 * i18next plural suffixes (`_one`, `_other`, `_few`, …) differ per language by
 * design, so a key matches when its plural stem exists on both sides.
 *
 * Each key must also use the same i18next placeholders (`{{name}}`,
 * `$t(other.key)`) as the reference, plural forms counted together — a
 * dropped `{{count}}` renders without its value (ported from clocknet copy-lint).
 *
 * Usage: node script/check-locale-parity.ts [--locales-dir <dir>] [--reference <lang>]
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { formatSet, placeholdersByStem, sameSet } from './lib/i18n-placeholders.ts'

type Issue = { lang: string, file: string, message: string }

const args = process.argv.slice(2)
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const ROOT = process.cwd()
const LOCALES_DIR = path.resolve(ROOT, flag('--locales-dir', 'src/i18n/locales'))
const REFERENCE = flag('--reference', 'en')
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/

function flatten(value: unknown, prefix = '', out = new Map<string, unknown>()): Map<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value))
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
  }
  else {
    out.set(prefix, value)
  }
  return out
}

function stem(key: string): string {
  return key.replace(PLURAL_SUFFIX, '')
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }
  catch (error) {
    throw new Error(`${path.relative(ROOT, file)} is not valid JSON: ${(error as Error).message}`)
  }
}

function main(): void {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`✖ Locales directory not found: ${path.relative(ROOT, LOCALES_DIR)}`)
    process.exit(1)
  }
  const languages = fs.readdirSync(LOCALES_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  if (!languages.includes(REFERENCE)) {
    console.error(`✖ Reference locale "${REFERENCE}" not found in ${path.relative(ROOT, LOCALES_DIR)}`)
    process.exit(1)
  }

  const refDir = path.join(LOCALES_DIR, REFERENCE)
  const namespaces = fs.readdirSync(refDir).filter(f => f.endsWith('.json'))
  const issues: Issue[] = []
  let keyCount = 0

  for (const ns of namespaces) {
    const refKeys = flatten(readJson(path.join(refDir, ns)))
    keyCount += refKeys.size
    const refStems = new Set([...refKeys.keys()].map(stem))
    const refPlaceholders = placeholdersByStem(refKeys, stem)

    for (const lang of languages.filter(l => l !== REFERENCE)) {
      const file = path.join(LOCALES_DIR, lang, ns)
      if (!fs.existsSync(file)) {
        issues.push({ lang, file: ns, message: `missing file (${refKeys.size} keys)` })
        continue
      }
      const keys = flatten(readJson(file))
      const stems = new Set([...keys.keys()].map(stem))

      for (const key of refKeys.keys()) {
        if (!stems.has(stem(key)))
          issues.push({ lang, file: ns, message: `missing key "${key}"` })
      }
      for (const [key, value] of keys) {
        if (!refStems.has(stem(key)))
          issues.push({ lang, file: ns, message: `extra key "${key}" (not in ${REFERENCE})` })
        else if (typeof value === 'string' && value.trim() === '')
          issues.push({ lang, file: ns, message: `empty value for "${key}"` })
      }

      // Same {{placeholders}} / $t() nesting per key, plural forms counted together.
      const langPlaceholders = placeholdersByStem(keys, stem)
      for (const [keyStem, refSet] of refPlaceholders) {
        const own = langPlaceholders.get(keyStem)
        if (own && !sameSet(own, refSet))
          issues.push({ lang, file: ns, message: `placeholders differ for "${keyStem}": ${REFERENCE} has ${formatSet(refSet)}, ${lang} has ${formatSet(own)}` })
      }
    }
  }

  const knownNamespaces = new Set(namespaces) // one lookup per file of every locale
  for (const lang of languages) {
    const dir = path.join(LOCALES_DIR, lang)
    for (const extra of fs.readdirSync(dir).filter(f => f.endsWith('.json') && !knownNamespaces.has(f)))
      issues.push({ lang, file: extra, message: `namespace not in ${REFERENCE}` })
  }

  if (issues.length > 0) {
    for (const issue of issues)
      console.error(`✖ ${issue.lang}/${issue.file}: ${issue.message}`)
    console.error(`\n${issues.length} locale issue(s). Reference: ${REFERENCE}, ${namespaces.length} namespaces, ${keyCount} keys.`)
    process.exit(1)
  }
  console.log(`✔ ${languages.length} locales in parity with ${REFERENCE} (${namespaces.length} namespaces, ${keyCount} keys).`)
}

main()
