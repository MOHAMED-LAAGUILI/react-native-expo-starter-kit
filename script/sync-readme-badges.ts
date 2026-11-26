#!/usr/bin/env node
/// <reference types="node" />
/**
 * Regenerates the README badges from package.json, so the versions shown are
 * always the ones the project actually uses (the installed version when
 * node_modules exists, else the declared range without its ^/~ prefix).
 *
 *   <!-- badges:key:start --> … <!-- badges:key:end -->   headline stack, under the title
 *   <!-- badges:all:start --> … <!-- badges:all:end -->   every dependency + devDependency,
 *                                                         each linking to npm
 *
 * Usage:
 *   node script/sync-readme-badges.ts           # rewrite README.md
 *   node script/sync-readme-badges.ts --check   # exit 1 if README is out of date (CI, checks)
 *
 * Run automatically by `pnpm run release` after the version bump.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

type Badge = { label: string, version: string, color: string, logo?: string, href: string }

const ROOT = process.cwd()
const README = path.join(ROOT, 'README.md')
const CHECK = process.argv.includes('--check')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

/**
 * Headline badges, in display order. `pkg` entries take their version from
 * the installed package and are skipped when it is not a dependency, so a
 * removed library never leaves a stale badge behind. `value` entries are static.
 */
type KeyBadge = { label: string, color: string, logo?: string } & ({ pkg: string, major?: boolean, bundled?: boolean } | { value: string, href: string })

const KEY_BADGES: KeyBadge[] = [
  { label: 'React', pkg: 'react', color: '149ECA', logo: 'react' },
  { label: 'React Native', pkg: 'react-native', color: '61DAFB', logo: 'react' },
  { label: 'Expo SDK', pkg: 'expo', major: true, color: '000020', logo: 'expo' },
  { label: 'TypeScript', pkg: 'typescript', color: '3178C6', logo: 'typescript' },
  { label: 'Expo Router', pkg: 'expo-router', color: '000000', logo: 'expo' },
  { label: 'Tailwind CSS', pkg: 'tailwindcss', color: '38BDF8', logo: 'tailwindcss' },
  { label: 'Uniwind', pkg: 'uniwind', color: '06B6D4' },
  { label: 'CVA', pkg: 'class-variance-authority', color: '000000' },
  { label: 'cn', pkg: 'cn', color: '000000' },
  { label: 'Lucide', pkg: 'lucide-react-native', color: 'F56565', logo: 'lucide' },
  { label: 'RN Primitives', pkg: '@rn-primitives/portal', color: '111827' },
  { label: 'RN SVG', pkg: 'react-native-svg', color: 'FF6B6B' },
  { label: 'Keyboard Controller', pkg: 'react-native-keyboard-controller', color: '6366F1' },
  { label: 'Safe Area', pkg: 'react-native-safe-area-context', color: '0EA5E9' },
  { label: 'RN Screens', pkg: 'react-native-screens', color: '0EA5E9' },
  { label: 'Zustand', pkg: 'zustand', color: '764ABC' },
  { label: 'TanStack Query', pkg: '@tanstack/react-query', color: 'FF4154', logo: 'reactquery' },
  { label: 'TanStack Form', pkg: '@tanstack/react-form', color: 'FF4154' },
  { label: 'Zod', pkg: 'zod', color: '3068B7', logo: 'zod' },
  { label: 'Axios', pkg: 'axios', color: '5A29E4', logo: 'axios' },
  { label: 'i18next', pkg: 'i18next', color: '26A69A', logo: 'i18next' },
  { label: 'react-i18next', pkg: 'react-i18next', color: '26A69A' },
  { label: 'Expo SecureStore', pkg: 'expo-secure-store', color: '4CAF50', logo: 'expo' },
  { label: 'MMKV', pkg: 'react-native-mmkv', color: '4CAF50' },
  { label: 'Reanimated', pkg: 'react-native-reanimated', color: 'FFCA28' },
  { label: 'Gesture Handler', pkg: 'react-native-gesture-handler', color: '7C4DFF' },
  { label: 'Bottom Sheet', pkg: '@gorhom/bottom-sheet', color: '0F172A' },
  { label: 'Worklets', pkg: 'react-native-worklets', color: 'F59E0B' },
  { label: 'Expo Dev Client', pkg: 'expo-dev-client', color: '000020', logo: 'expo' },
  { label: 'Expo Updates', pkg: 'expo-updates', color: '000020', logo: 'expo' },
  { label: 'Expo Notifications', pkg: 'expo-notifications', color: '000020', logo: 'expo' },
  { label: 'Expo Image', pkg: 'expo-image', color: '000020', logo: 'expo' },
  { label: 'Expo Video', pkg: 'expo-video', color: '000020', logo: 'expo' },
  { label: 'Expo Audio', pkg: 'expo-audio', color: '000020', logo: 'expo' },
  { label: 'Expo Location', pkg: 'expo-location', color: '000020', logo: 'expo' },
  { label: 'ESLint', pkg: 'eslint', color: '4B32C3', logo: 'eslint' },
  { label: 'Prettier', pkg: 'prettier', color: 'F7B93E', logo: 'prettier' },
  { label: 'Husky', pkg: 'husky', color: 'FF6B35' },
  { label: 'React Compiler', pkg: 'babel-plugin-react-compiler', bundled: true, color: '149ECA', logo: 'react' },
  { label: 'React Doctor', pkg: 'react-doctor', color: '0EA5E9' },
  { label: 'TanStack Devtools', pkg: '@tanstack/react-query-devtools', color: 'FF4154', logo: 'reactquery' },
  { label: 'Jest', pkg: 'jest', color: 'C21325', logo: 'jest' },
  { label: 'RN Testing Library', pkg: '@testing-library/react-native', color: 'E33332' },
  { label: 'Maestro', value: 'E2E', color: '6A4DF4', href: 'https://maestro.dev' },
  { label: 'release-it', pkg: 'release-it', color: '000000' },
  { label: 'Expo Doctor', value: 'Enabled', color: '000020', logo: 'expo', href: 'https://docs.expo.dev/develop/tools/#expo-doctor' },
  { label: 'RN Web', pkg: 'react-native-web', color: '61DAFB' },
  { label: 'Platform', value: 'iOS | Android | Web', color: '000000', href: 'https://docs.expo.dev' },
  { label: 'RN', value: 'New Architecture', color: '61DAFB', href: 'https://reactnative.dev/architecture/landing-page' },
  { label: 'OTA', value: 'Enabled', color: '10B981', href: 'https://docs.expo.dev/eas-update/introduction/' },
]

/** shields.io logo slug by package-name prefix (first match wins). */
const LOGOS: Array<[prefix: string, logo: string]> = [
  ['expo', 'expo'],
  ['@expo', 'expo'],
  ['@tanstack', 'reactquery'],
  ['react-native', 'react'],
  ['@react-native', 'react'],
  ['react', 'react'],
  ['typescript', 'typescript'],
  ['@typescript', 'typescript'],
  ['tailwind', 'tailwindcss'],
  ['eslint', 'eslint'],
  ['@eslint', 'eslint'],
  ['jest', 'jest'],
  ['babel', 'babel'],
  ['@babel', 'babel'],
  ['axios', 'axios'],
  ['i18next', 'i18next'],
  ['zod', 'zod'],
  ['husky', 'git'],
]

function installedVersion(name: string): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', name, 'package.json'), 'utf8')).version
  }
  catch {
    const declared: string = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? ''
    return declared.replace(/^[~^>=<\s]+/, '') || 'unknown'
  }
}

/** shields.io static badge escaping: `-` → `--`, `_` → `__`, then URL-encode. */
function shield(text: string): string {
  return encodeURIComponent(text.replace(/-/g, '--').replace(/_/g, '__'))
}

function badgeUrl(b: Badge): string {
  return `https://img.shields.io/badge/${shield(b.label)}-${shield(b.version)}-${b.color}${b.logo ? `?logo=${b.logo}&logoColor=white` : ''}`
}

function logoFor(name: string): string | undefined {
  return LOGOS.find(([prefix]) => name.startsWith(prefix))?.[1]
}

function html(b: Badge): string {
  return `<a href="${b.href}"><img alt="${b.label} ${b.version}" src="${badgeUrl(b)}" /></a>`
}

function isDependency(name: string): boolean {
  return name in (pkg.dependencies ?? {}) || name in (pkg.devDependencies ?? {})
}

function keyBlock(): string {
  const badges: Badge[] = []
  for (const entry of KEY_BADGES) {
    if ('pkg' in entry) {
      // `bundled`: shipped inside another package (e.g. babel-preset-expo) — shown when installed.
      if (entry.bundled ? !fs.existsSync(path.join(ROOT, 'node_modules', entry.pkg, 'package.json')) : !isDependency(entry.pkg))
        continue
      const version = installedVersion(entry.pkg)
      badges.push({ label: entry.label, version: entry.major ? version.split('.')[0] : version, color: entry.color, logo: entry.logo, href: `https://www.npmjs.com/package/${entry.pkg}` })
    }
    else {
      badges.push({ label: entry.label, version: entry.value, color: entry.color, logo: entry.logo, href: entry.href })
    }
  }
  const credits: Badge[] = [
    { label: 'Made by', version: 'Mohamed LAAGUILI', color: '0A7EA4', href: 'https://github.com/MOHAMED-LAAGUILI' },
    { label: 'Version', version: pkg.version, color: '2563EB', href: 'https://github.com/MOHAMED-LAAGUILI/react-native-expo-starter-kit/releases' },
  ]
  return `<p align="center">\n${badges.map(html).join('\n')}\n</p>\n\n<p align="center">\n${credits.map(html).join('\n')}\n</p>`
}

function allBlock(): string {
  const section = (title: string, deps: Record<string, string>, color: string) => {
    const names = Object.keys(deps ?? {}).sort((a, b) => a.localeCompare(b))
    const badges = names.map(name => html({ label: name, version: installedVersion(name), color, logo: logoFor(name), href: `https://www.npmjs.com/package/${name}` }))
    return `**${title} (${names.length})**\n\n${badges.join('\n')}`
  }
  const total = Object.keys(pkg.dependencies ?? {}).length + Object.keys(pkg.devDependencies ?? {}).length
  return [
    `<details>\n<summary><b>All ${total} packages</b> — versions generated from package.json (<code>pnpm run docs:badges</code>)</summary>\n`,
    section('Dependencies', pkg.dependencies, '0A7EA4'),
    '',
    section('Dev dependencies', pkg.devDependencies, '6E7781'),
    '\n</details>',
  ].join('\n')
}

/** Fills a marker block. `required` blocks must exist; optional ones are skipped when absent. */
function replaceBlock(text: string, name: string, body: () => string, required: boolean): string {
  const start = `<!-- badges:${name}:start -->`
  const end = `<!-- badges:${name}:end -->`
  const from = text.indexOf(start)
  const to = text.indexOf(end)
  if (from < 0 || to < from) {
    if (required)
      throw new Error(`README.md is missing the ${start} … ${end} markers`)
    return text
  }
  return `${text.slice(0, from + start.length)}\n${body()}\n${text.slice(to)}`
}

const raw = fs.readFileSync(README, 'utf8')
const eol = raw.includes('\r\n') ? '\r\n' : '\n'
const current = raw.replace(/\r\n/g, '\n')
// `key` = headline badges (required); `all` = every package (optional — add the
// markers anywhere in the README to get the full list).
const next = replaceBlock(replaceBlock(current, 'key', keyBlock, true), 'all', allBlock, false)

if (CHECK) {
  if (next !== current) {
    console.error('✖ README badges are out of date — run `pnpm run docs:badges` and commit README.md.')
    process.exit(1)
  }
  console.log('✔ README badges match package.json')
}
else if (next !== current) {
  fs.writeFileSync(README, next.replace(/\n/g, eol))
  console.log('✔ README badges updated from package.json')
}
else {
  console.log('✔ README badges already up to date')
}
