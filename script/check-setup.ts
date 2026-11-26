#!/usr/bin/env node
/// <reference types="node" />
/**
 * Checks this machine has what the project needs, before anything fails
 * half-way through an install or a native build. Every line ends in a fix.
 *
 *   ✔ ok   ⚠ optional / degraded   ✖ required and missing
 *
 * Exit code 1 only when something REQUIRED is missing, so it can gate CI or a
 * bootstrap script; optional tools (Maestro, Watchman, Xcode) only warn.
 *
 * Usage: node script/check-setup.ts [--android] [--ios] [--e2e]
 *   Each flag makes that toolchain required instead of optional.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawn } from './lib/spawn.ts'

type Level = 'ok' | 'warn' | 'fail'
type Check = { name: string, level: Level, detail: string, fix?: string }

const ROOT = process.cwd()
const IS_WINDOWS = process.platform === 'win32'
const IS_MAC = process.platform === 'darwin'
const args = new Set(process.argv.slice(2))
const strict = { android: args.has('--android'), ios: args.has('--ios'), e2e: args.has('--e2e') }
const results: Check[] = []
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

function version(command: string, versionArgs: string[] = ['--version']): string | null {
  const result = spawn(command, versionArgs)
  if (result.status !== 0)
    return null
  return `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split(/\r?\n/)[0] ?? ''
}

function major(text: string | null): number {
  return Number(text?.match(/(\d+)\.\d+/)?.[1] ?? 0)
}

/** Required when the matching flag is passed, a warning otherwise. */
function need(isStrict: boolean): Level {
  return isStrict ? 'fail' : 'warn'
}

function add(name: string, ok: boolean, detail: string, fix: string, whenMissing: Level = 'fail'): void {
  results.push({ name, level: ok ? 'ok' : whenMissing, detail, fix: ok ? undefined : fix })
}

function checkNode(): void {
  const wanted = String(pkg.engines?.node ?? '>=22.18').replace(/[^\d.]/g, '')
  const [wMaj, wMin] = wanted.split('.').map(Number)
  const [maj, min] = process.versions.node.split('.').map(Number)
  const recentEnough = maj > wMaj || (maj === wMaj && min >= wMin)
  const odd = maj % 2 === 1
  results.push({
    name: 'Node.js',
    level: recentEnough && !odd ? 'ok' : recentEnough ? 'warn' : 'fail',
    detail: `v${process.versions.node} (needs >= ${wanted}${odd ? '; Expo does not support odd releases' : ''})`,
    fix: recentEnough && !odd ? undefined : 'Install the current LTS from https://nodejs.org (or `nvm install --lts`).',
  })
}

/** Version from a package.json, or "unknown" when the file is unreadable, not JSON, or has no string `version`. */
function readVersion(file: string): string {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (parsed && typeof parsed === 'object' && 'version' in parsed && typeof parsed.version === 'string')
      return parsed.version
  }
  catch {}
  return 'unknown (unreadable package.json — reinstall)'
}

function checkPackages(): void {
  const wanted = String(pkg.packageManager ?? '').replace('pnpm@', '')
  const pnpm = version('pnpm')
  add('pnpm', Boolean(pnpm), pnpm ? `${pnpm} (project pins ${wanted || 'none'})` : 'not found', '`corepack enable` — it activates the pinned pnpm.')

  const expoPkg = path.join(ROOT, 'node_modules', 'expo', 'package.json')
  const installed = fs.existsSync(expoPkg)
  const missingBins = ['eslint', 'jest', 'tsc', 'expo'].filter(bin => !fs.existsSync(path.join(ROOT, 'node_modules', '.bin', IS_WINDOWS ? `${bin}.CMD` : bin)))
  add(
    'node_modules',
    installed && missingBins.length === 0,
    !installed ? 'not installed' : missingBins.length ? `missing .bin links: ${missingBins.join(', ')} (half-written install)` : `expo ${readVersion(expoPkg)}`,
    'Delete node_modules and run `pnpm run install:safe`.',
  )

  const missingEnv = ['development', 'preview', 'production'].filter(env => !fs.existsSync(path.join(ROOT, `.env.${env}`)))
  add('.env files', missingEnv.length === 0, missingEnv.length ? `missing: ${missingEnv.map(e => `.env.${e}`).join(', ')}` : 'development / preview / production present', '`pnpm run env:create`', 'warn')
}

function androidSdk(): string | undefined {
  return [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    IS_WINDOWS && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : undefined,
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
  ].find((dir): dir is string => Boolean(dir) && fs.existsSync(dir as string))
}

function checkAndroid(): void {
  const level = need(strict.android)
  const java = version('java', ['-version'])
  const is17 = major(java) === 17 || Boolean(java?.includes('"17'))
  add('JDK 17', is17, java ?? 'not found', 'Install Temurin 17 (https://adoptium.net) and set JAVA_HOME.', level)

  const sdk = androidSdk()
  add('Android SDK', Boolean(sdk), sdk ?? 'not found (ANDROID_HOME unset)', 'Android Studio → SDK Manager, then set ANDROID_HOME.', level)

  const adbPath = sdk ? path.join(sdk, 'platform-tools', IS_WINDOWS ? 'adb.exe' : 'adb') : 'adb'
  const adb = version(fs.existsSync(adbPath) ? adbPath : 'adb')
  add('adb', Boolean(adb), adb ?? 'not found', 'SDK Manager → SDK Tools → Android SDK Platform-Tools.', level)

  if (IS_WINDOWS && sdk) {
    const cmakeRoot = path.join(sdk, 'cmake')
    const longPathCmake = fs.existsSync(cmakeRoot) && fs.readdirSync(cmakeRoot).some(v => /^3\.\d+/.test(v) && Number(v.split('.')[1]) >= 30)
    add('CMake 3.30+', longPathCmake, longPathCmake ? 'installed (long-path safe native builds)' : 'not installed', 'SDK Manager → SDK Tools → CMake 3.30+ (avoids "Filename longer than 260 characters").', 'warn')
  }
}

function checkIos(): void {
  if (!IS_MAC) {
    if (strict.ios)
      add('Xcode', false, 'iOS builds need macOS', 'Use `pnpm run build:prev:ios` (EAS) from this machine.')
    return
  }
  const level = need(strict.ios)
  const xcode = version('xcodebuild', ['-version'])
  add('Xcode', Boolean(xcode), xcode ?? 'not found', 'Install Xcode from the App Store, then `xcode-select --install`.', level)
  const pods = version('pod')
  add('CocoaPods', Boolean(pods), pods ?? 'not found', '`brew install cocoapods`', level)
}

function checkTools(): void {
  const git = version('git')
  add('git', Boolean(git), git ?? 'not found', 'Install git — Husky hooks and EAS need it.')
  const watchman = version('watchman')
  add('Watchman', Boolean(watchman), watchman ?? 'not found — Metro falls back to its native watcher (slower first start)', IS_WINDOWS ? '`choco install watchman`' : '`brew install watchman`', 'warn')
  const ffmpeg = version('ffmpeg', ['-version'])
  add('ffmpeg', Boolean(ffmpeg), ffmpeg ?? 'not found (only needed for `pnpm run demo:record`)', IS_WINDOWS ? '`winget install ffmpeg`' : '`brew install ffmpeg` / `apt install ffmpeg`', 'warn')
  const docker = version('docker')
  add('Docker', Boolean(docker), docker ?? 'not found (only needed for `pnpm run docker:*`)', 'Install Docker Desktop (Windows/macOS) or Docker Engine (Linux).', 'warn')
  const maestro = version('maestro')
  add('Maestro CLI', Boolean(maestro), maestro ?? 'not found (only needed for `pnpm run e2e:*`)', 'install it from `https://docs.maestro.dev/getting-started/installing-maestro` (Windows: via WSL)', need(strict.e2e))
}

checkNode()
checkPackages()
checkAndroid()
checkIos()
checkTools()

const icon: Record<Level, string> = { ok: '✔', warn: '⚠', fail: '✖' }
const width = Math.max(...results.map(r => r.name.length))
for (const r of results) {
  console.log(`${icon[r.level]} ${r.name.padEnd(width)}  ${r.detail}`)
  if (r.fix)
    console.log(`  ${' '.repeat(width)}  → ${r.fix}`)
}
const failed = results.filter(r => r.level === 'fail').length
const warned = results.filter(r => r.level === 'warn').length
console.log(`\n${results.length - failed - warned} ok · ${warned} warning(s) · ${failed} missing`)
if (failed > 0)
  process.exitCode = 1
