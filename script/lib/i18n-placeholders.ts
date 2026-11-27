/// <reference types="node" />
/**
 * i18next placeholder parity, ported from clocknet's copy lint.
 *
 * A translation that drops or renames `{{name}}` renders a raw `{{name}}` or
 * loses the value; a missing `$t(key)` nesting silently drops text. Keys are
 * compared per plural stem: `items_one` and `items_other` together must use the
 * same set in every language, because languages have different plural forms.
 */

/** Placeholders in one i18next string: `{{name}}`, `{{val, number}}` → `{{val}}`, `$t(key)`. */
export function placeholdersOf(text: string): Set<string> {
  const found = new Set<string>()
  for (const m of text.matchAll(/\{\{\s*-?\s*([^},\s]+)[^}]*\}\}/g))
    found.add(`{{${m[1]}}}`)
  for (const m of text.matchAll(/\$t\(([^)]+)\)/g))
    found.add(`$t(${m[1].trim()})`)
  return found
}

/** Union of the placeholders of every string value, grouped by `stemOf(key)`. */
export function placeholdersByStem(values: Map<string, unknown>, stemOf: (key: string) => string): Map<string, Set<string>> {
  const byStem = new Map<string, Set<string>>()
  for (const [key, value] of values) {
    if (typeof value !== 'string')
      continue
    const stem = stemOf(key)
    const set = byStem.get(stem) ?? new Set<string>()
    for (const p of placeholdersOf(value))
      set.add(p)
    byStem.set(stem, set)
  }
  return byStem
}

export function sameSet(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every(x => b.has(x))
}

export function formatSet(set: Set<string>): string {
  return set.size === 0 ? 'none' : [...set].sort().join(', ')
}
