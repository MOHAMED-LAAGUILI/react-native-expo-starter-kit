#!/usr/bin/env node
/// <reference types="node" />
/**
 * Upgrades the Expo SDK end to end — the procedure in docs/UPGRADING.md,
 * including the Windows workarounds this repo needed:
 *
 *   1. guard       nothing may hold node_modules (Metro, Gradle, another pnpm)
 *   2. bump        expo → latest release of the target SDK
 *   3. install     pnpm install; on EPERM/EBUSY (Windows file locks) delete
 *                  node_modules and install fresh — fresh installs never rename
 *                  over existing folders, in-place updates do
 *   4. align       `expo install --fix`; if its own pnpm call hits a lock, take
 *                  the version list it printed, write it to package.json and
 *                  reinstall
 *   5. companions  @types/react ↔ react, @react-native/metro-config ↔ react-native,
 *                  @expo/config ↔ SDK (expo install doesn't touch these)
 *   6. verify      type:check, test, expo-doctor
 *
 * The Expo CLI is invoked as `node node_modules/expo/bin/cli`, never `npx expo`
 * (newer npm resolves npx bins from the wrong directory in this repo).
 *
 * Usage:
 *   node script/upgrade-expo.ts                # latest SDK
 *   node script/upgrade-expo.ts --sdk 59       # a specific SDK
 *   node script/upgrade-expo.ts --dry-run      # print the plan only
 *   node script/upgrade-expo.ts --skip-verify  # stop after installing
 *
 * Afterwards (printed at the end): read the release notes, rebuild the dev
 * client, bump `version` in package.json (runtimeVersion uses appVersion).
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from './lib/spawn.ts'

const ROOT = process.cwd()
const PKG_PATH = path.join(ROOT, 'package.json')
const EXPO_CLI = path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli')
const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_VERIFY = argv.includes('--skip-verify')
const sdkFlag = argv.indexOf('--sdk')
const REQUESTED_SDK = sdkFlag >= 0 ? Number(argv[sdkFlag + 1]) : undefined

type Result = { status: number | null, output: string }

function step(title: string): void {
  console.log(`\n━━ ${title}`)
}

function fail(message: string): never {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

function run(command: string, args: string[], { capture = false } = {}): Result {
  console.log(`› ${command === process.execPath ? 'node' : command} ${args.join(' ')}`)
  if (DRY_RUN)
    return { status: 0, output: '' }
  const result = spawn(command, args, {
    cwd: ROOT,
    stdio: capture ? 'pipe' : 'inherit',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, SKIP_INSTALL_GUARD: '1' },
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (capture)
    process.stdout.write(output.split(/\r?\n/).filter(l => !l.startsWith('Progress:')).join('\n'))
  return { status: result.status, output }
}

function readPkg(): Record<string, any> {
  return JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'))
}

function writePkg(pkg: Record<string, any>): void {
  if (DRY_RUN)
    return
  const sort = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
  pkg.dependencies = sort(pkg.dependencies)
  pkg.devDependencies = sort(pkg.devDependencies)
  fs.writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`)
}

function setVersion(pkg: Record<string, any>, name: string, version: string): boolean {
  const section = name in (pkg.dependencies ?? {}) ? 'dependencies' : name in (pkg.devDependencies ?? {}) ? 'devDependencies' : null
  if (!section || pkg[section][name] === version)
    return false
  console.log(`  ${name}: ${pkg[section][name]} → ${version}`)
  pkg[section][name] = version
  return true
}

/** Compares two plain x.y.z versions numerically. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0))
      return (pa[i] ?? 0) - (pb[i] ?? 0)
  }
  return 0
}

/** Highest stable (no pre-release tag) published version matching `spec`. npm's order is not semver order. */
function latestStable(spec: string): string | undefined {
  return npmView(spec).filter(v => /^\d+\.\d+\.\d+$/.test(v)).sort(compareVersions).at(-1)
}

function npmView(spec: string): string[] {
  const result = spawn('npm', ['view', spec, 'version', '--json'])
  if (result.status !== 0)
    fail(`npm view ${spec} failed: ${result.stderr.trim().split('\n').pop()}`)
  const parsed = JSON.parse(result.stdout.trim() || '[]')
  return Array.isArray(parsed) ? parsed : [parsed]
}

function installedVersion(name: string): string | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', name, 'package.json'), 'utf8')).version
  }
  catch {
    return undefined
  }
}

const isLockError = (output: string) => /\b(?:EPERM|EBUSY|ENOTEMPTY)\b/.test(output)

/** pnpm install; on a Windows lock error, delete node_modules and install fresh once. */
function install(): void {
  const first = run('pnpm', ['install'], { capture: true })
  if (first.status === 0)
    return
  if (!isLockError(first.output))
    fail('pnpm install failed (not a file-lock error) — see the output above.')
  console.warn('\n⚠ A file in node_modules was locked mid-install. Deleting node_modules and installing fresh…')
  if (!DRY_RUN) {
    try {
      fs.rmSync(path.join(ROOT, 'node_modules'), { recursive: true, force: true, maxRetries: 5, retryDelay: 2000 })
    }
    catch (error) {
      fail(`Could not delete node_modules (${(error as Error).message}). Close your editor/Metro and run this again.`)
    }
  }
  if (run('pnpm', ['install'], { capture: true }).status !== 0)
    fail('Fresh pnpm install failed — see the output above.')
}

/** `expo install --fix`; if its pnpm call hits a lock, apply the version list it printed. */
function alignWithExpo(): void {
  const result = run(process.execPath, [EXPO_CLI, 'install', '--fix'], { capture: true })
  if (result.status === 0)
    return
  const match = result.output.match(/pnpm add ((?:\S+@\S+\s?)+?) exited/)
  if (!isLockError(result.output) || !match)
    fail('`expo install --fix` failed — see the output above.')
  console.warn('\n⚠ expo install hit a file lock. Writing its version list to package.json and reinstalling…')
  const pkg = readPkg()
  for (const spec of match[1].trim().split(/\s+/)) {
    const at = spec.lastIndexOf('@')
    if (at > 0)
      setVersion(pkg, spec.slice(0, at), spec.slice(at + 1))
  }
  writePkg(pkg)
  install()
}

function alignCompanions(sdk: number): boolean {
  const pkg = readPkg()
  const react = installedVersion('react')
  const rn = installedVersion('react-native')
  let changed = false
  // Only move @types/react when React's major.minor changed — never downgrade a patch.
  const reactMinor = react?.split('.').slice(0, 2).join('.')
  const typesSpec: string = pkg.devDependencies?.['@types/react'] ?? ''
  if (reactMinor && !typesSpec.replace(/^[~^]/, '').startsWith(`${reactMinor}.`)) {
    const types = latestStable(`@types/react@~${reactMinor}.0`)
    if (types)
      changed = setVersion(pkg, '@types/react', `~${types}`) || changed
  }
  if (rn)
    changed = setVersion(pkg, '@react-native/metro-config', rn) || changed
  changed = setVersion(pkg, '@expo/config', `^${sdk}.0.0`) || changed
  if (changed)
    writePkg(pkg)
  return changed
}

function main(): void {
  if (!fs.existsSync(EXPO_CLI))
    fail('node_modules is missing — run `pnpm run install:safe` first.')

  const current = Number((installedVersion('expo') ?? '0').split('.')[0])
  const latestMajor = Number(npmView('expo@latest')[0].split('.')[0])
  const target = REQUESTED_SDK ?? latestMajor
  if (!Number.isInteger(target) || target <= 0)
    fail('--sdk needs a number, e.g. --sdk 59')
  const targetVersion = latestStable(`expo@^${target}.0.0`)
  if (!targetVersion)
    fail(`No published expo release for SDK ${target}.`)

  console.log(`Expo SDK ${current} → ${target} (expo@${targetVersion})${DRY_RUN ? '  [dry run]' : ''}`)
  if (current === target && !argv.includes('--force'))
    console.log('Already on that SDK — re-aligning packages only (pass --force to reinstall anyway).')

  step('1. Guard: nothing may hold node_modules')
  if (run(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'script/guard-node-modules.ts']).status !== 0)
    fail('Stop the processes listed above, then run this again.')

  step(`2. Bump expo to ~${targetVersion}`)
  const pkg = readPkg()
  setVersion(pkg, 'expo', `~${targetVersion}`)
  writePkg(pkg)

  step('3. Install')
  install()

  step('4. Align SDK-managed packages (expo install --fix)')
  alignWithExpo()

  step('5. Companion packages expo install does not manage')
  if (alignCompanions(target))
    install()
  else
    console.log('  already aligned')

  if (!SKIP_VERIFY) {
    step('6. Verify')
    const checks: Array<[string, string[]]> = [
      ['pnpm', ['run', 'type:check']],
      ['pnpm', ['test']],
      // Not a project dependency — always the latest doctor, like `pnpm run doctor`.
      ['npx', ['--yes', 'expo-doctor@latest']],
    ]
    const failed = checks.filter(([cmd, cmdArgs]) => run(cmd, cmdArgs).status !== 0).map(([, a]) => a.join(' '))
    if (failed.length)
      console.warn(`\n⚠ Failing after the upgrade: ${failed.join(' · ')} — usually API changes from the release notes below.`)
  }

  console.log(`
━━ Next steps
  1. Read https://expo.dev/changelog (SDK ${target}) and https://docs.expo.dev/router/migrate/ — fix what they list.
  2. Rebuild the dev client: npx expo run:android --device <avd-name>   (an SDK bump always changes native code)
  3. Bump "version" in package.json — runtimeVersion uses the appVersion policy.
  4. Record what changed in docs/UPGRADING.md, then \`pnpm run checks\`.`)
}

main()
