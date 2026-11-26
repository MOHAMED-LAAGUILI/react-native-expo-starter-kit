#!/usr/bin/env node
/// <reference types="node" />
/**
 * Builds a release APK on this machine — no EAS cloud build, no queue, no
 * build credits. The APK is signed with the local debug keystore, so it can be
 * sideloaded on a phone or emulator but NOT uploaded to the Play Store (use
 * `pnpm run build:prod:android` for that).
 *
 * Profile settings come from `eas.json` (`build.<profile>`), so a local
 * preview build matches the EAS preview build:
 *   - `env`                                                 → exported for prebuild + Gradle
 *   - `android.gradleCommand` `-PreactNativeArchitectures=` → default ABIs
 *
 * Usage:
 *   pnpm run build:local:android                         # preview profile, eas.json ABIs
 *   pnpm run build:local:android -- --emulator           # + x86_64 for emulators
 *   pnpm run build:local:android -- --install            # then `adb install -r`
 *   pnpm run build:local:android -- --profile production --arch arm64-v8a
 *   pnpm run build:local:android -- --clean              # regenerate android/ from scratch
 *
 * Output: dist/<name>-<version>-<profile>[-emulator]-<YYYYMMDD-HHmm>.apk
 *
 * Needs JDK 17 and the Android SDK (ANDROID_HOME, or the default install path).
 * A cold first build takes 15–30 minutes; later builds reuse the Gradle cache.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawn } from './lib/spawn.ts'

type Options = {
  profile: string
  arch?: string
  emulator: boolean
  install: boolean
  clean: boolean
}

type Profile = {
  env: Record<string, string>
  arch: string
}

type RunOptions = {
  cwd: string
  env: NodeJS.ProcessEnv
  allowFailure?: boolean
}

const ROOT = process.cwd()
const ANDROID = path.join(ROOT, 'android')
const IS_WINDOWS = process.platform === 'win32'
const DEFAULT_ARCH = 'arm64-v8a'

function fail(message: string): never {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { profile: 'preview', emulator: false, install: false, clean: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--')
      continue
    if (arg === '--profile')
      opts.profile = argv[++i] ?? fail('--profile needs a value')
    else if (arg === '--arch')
      opts.arch = argv[++i] ?? fail('--arch needs a value')
    else if (arg === '--emulator')
      opts.emulator = true
    else if (arg === '--install')
      opts.install = true
    else if (arg === '--clean')
      opts.clean = true
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: build-local-android [--profile <name>] [--arch <abis>] [--emulator] [--install] [--clean]')
      process.exit(0)
    }
    else {
      fail(`Unknown option: ${arg}`)
    }
  }
  return opts
}

function readProfile(name: string): Profile {
  const easPath = path.join(ROOT, 'eas.json')
  if (!fs.existsSync(easPath))
    fail('eas.json not found — run this from the project root.')
  const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'))
  const profile = eas.build?.[name]
  if (!profile)
    fail(`No build profile "${name}" in eas.json (have: ${Object.keys(eas.build ?? {}).join(', ')})`)
  const gradle: string = profile.android?.gradleCommand ?? ''
  const archMatch = gradle.match(/-PreactNativeArchitectures=(\S+)/)
  return { env: profile.env ?? {}, arch: archMatch ? archMatch[1] : DEFAULT_ARCH }
}

function run(command: string, args: string[], options: RunOptions): boolean {
  console.log(`\n› ${command} ${args.join(' ')}`)
  const result = spawn(command, args, { cwd: options.cwd, env: options.env, stdio: 'inherit' })
  if (result.status === 0)
    return true
  if (options.allowFailure)
    return false
  return fail(`${command} exited with code ${result.status ?? result.signal}`)
}

function androidSdk(): string {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    IS_WINDOWS && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : undefined,
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
  ].filter((value): value is string => Boolean(value))
  const sdk = candidates.find(dir => fs.existsSync(dir))
  return sdk ?? fail(`Android SDK not found. Set ANDROID_HOME (looked in: ${candidates.join(', ')})`)
}

/**
 * Windows only: the CMake bundled with the NDK trips the 260-character path
 * limit on deep native-module paths. CMake 3.30+ handles long paths, so point
 * Gradle at the newest 3.x the SDK manager installed (CMake 4 drops old
 * `cmake_minimum_required` values that some libraries still declare).
 */
function longPathCmake(sdk: string): string | undefined {
  const cmakeRoot = path.join(sdk, 'cmake')
  if (!fs.existsSync(cmakeRoot))
    return undefined
  const versions = fs.readdirSync(cmakeRoot)
    .filter(v => /^3\.\d+/.test(v) && Number(v.split('.')[1]) >= 30)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  return versions[0] ? path.join(cmakeRoot, versions[0]) : undefined
}

function writeLocalProperties(sdk: string): void {
  const toGradlePath = (p: string) => p.replace(/\\/g, '/').replace(/^([A-Z]):/i, '$1\\:')
  const lines = [`sdk.dir=${toGradlePath(sdk)}`]
  if (IS_WINDOWS) {
    const cmake = longPathCmake(sdk)
    if (cmake)
      lines.push(`cmake.dir=${toGradlePath(cmake)}`)
    else
      console.warn('⚠ No CMake 3.30+ in the Android SDK — a native build may fail with "Filename longer than 260 characters". Install it from SDK Manager → SDK Tools → CMake.')
  }
  fs.writeFileSync(path.join(ANDROID, 'local.properties'), `${lines.join('\n')}\n`)
}

/** Windows keeps classes.jar locked after a failed build; stop the daemon and retry once. */
function gradleAssemble(arch: string, env: NodeJS.ProcessEnv): void {
  const gradlew = path.join(ANDROID, IS_WINDOWS ? 'gradlew.bat' : 'gradlew')
  const args = ['assembleRelease', `-PreactNativeArchitectures=${arch}`]
  if (run(gradlew, args, { cwd: ANDROID, env, allowFailure: IS_WINDOWS }))
    return
  console.warn('\n⚠ Gradle failed — stopping the daemon (releases Windows file locks) and retrying once.')
  run(gradlew, ['--stop'], { cwd: ANDROID, env, allowFailure: true })
  run(gradlew, args, { cwd: ANDROID, env })
}

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2))
  const profile = readProfile(opts.profile)

  let arch = opts.arch ?? profile.arch
  if (opts.emulator && !arch.split(',').includes('x86_64'))
    arch = `${arch},x86_64`

  const appEnv = profile.env.EXPO_PUBLIC_APP_ENV ?? opts.profile
  const envFile = path.join(ROOT, `.env.${appEnv}`)
  if (!fs.existsSync(envFile))
    fail(`${path.basename(envFile)} is missing — run \`pnpm run env:create\` first.`)

  const env: NodeJS.ProcessEnv = { ...process.env, ...profile.env, NODE_ENV: 'production' }
  const sdk = androidSdk()

  console.log(`Building ${opts.profile} APK locally · ABIs: ${arch} · env: ${path.basename(envFile)}`)

  // `--no-clean` keeps android/ (and its Gradle/C++ caches) between builds;
  // pass --clean after a native dependency or config-plugin change.
  run('pnpm', ['exec', 'expo', 'prebuild', '--platform', 'android', '--no-install', opts.clean ? '--clean' : '--no-clean'], { cwd: ROOT, env })
  writeLocalProperties(sdk)
  gradleAssemble(arch, env)

  const built = path.join(ANDROID, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
  if (!fs.existsSync(built))
    fail(`Gradle finished but ${built} does not exist.`)

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  const outDir = path.join(ROOT, 'dist')
  fs.mkdirSync(outDir, { recursive: true })
  const name = `${pkg.name}-${pkg.version}-${opts.profile}${opts.emulator ? '-emulator' : ''}-${timestamp()}.apk`
  const target = path.join(outDir, name)
  fs.copyFileSync(built, target)

  const sizeMb = (fs.statSync(target).size / 1024 / 1024).toFixed(1)
  console.log(`\n✔ ${path.relative(ROOT, target)} (${sizeMb} MB)`)

  if (opts.install) {
    const adb = path.join(sdk, 'platform-tools', IS_WINDOWS ? 'adb.exe' : 'adb')
    run(fs.existsSync(adb) ? adb : 'adb', ['install', '-r', target], { cwd: ROOT, env })
    console.log('✔ Installed on the connected device.')
  }
}

main()
