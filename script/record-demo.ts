#!/usr/bin/env node
/// <reference types="node" />
/**
 * Records a guided tour of the app and puts it in the README.
 *
 *   1. starts a screen recording on the connected device
 *        Android: `adb shell screenrecord` (emulator or phone)
 *        iOS:     `xcrun simctl io booted recordVideo` (Simulator, macOS only)
 *   2. drives the app through .maestro/demo/tour.yaml with Maestro
 *   3. stops and pulls the recording, then with ffmpeg makes
 *        docs/assets/demo.gif  — plays inline on GitHub (kept under ~9 MB)
 *        docs/assets/demo.mp4  — full-quality H.264 copy
 *   4. rewrites the README block between <!-- demo:start --> and <!-- demo:end -->
 *
 * Needs: a device with the dev build installed, Metro in E2E mode
 * (`pnpm run e2e:metro` in another terminal), Maestro and ffmpeg on PATH.
 *
 * Usage:
 *   pnpm run demo:record                     # android
 *   pnpm run demo:record -- --platform ios   # iOS Simulator (macOS)
 *   pnpm run demo:record -- --skip-record    # re-encode the last recording and update README
 *   pnpm run demo:record -- --width 360 --fps 12
 */

import type { ChildProcess } from 'node:child_process'
import { spawn as spawnAsync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from './lib/spawn.ts'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
const flag = (name: string, fallback: string) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const PLATFORM = flag('--platform', 'android')
const WIDTH = Number(flag('--width', '360'))
const FPS = Number(flag('--fps', '12'))
const OUT_DIR = path.join(ROOT, 'docs', 'assets')
const RAW = path.join(ROOT, 'dist', 'demo', `raw-${PLATFORM}.mp4`)
const GIF = path.join(OUT_DIR, 'demo.gif')
const MP4 = path.join(OUT_DIR, 'demo.mp4')
const MAX_GIF_BYTES = 9 * 1024 * 1024
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const APP_ID: string = pkg.scripts['e2e:android'].match(/APP_ID=(\S+)/)?.[1] ?? 'com.rntemplate.app'

function fail(message: string): never {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

function need(command: string, args: string[], hint: string): void {
  if (spawn(command, args).status !== 0)
    fail(`${command} not found — ${hint}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function recordAndroid(): Promise<void> {
  const remote = '/sdcard/rn-demo.mp4'
  spawn('adb', ['shell', 'rm', '-f', remote])
  console.log('● Recording the device screen…')
  const recorder: ChildProcess = spawnAsync('adb', ['shell', 'screenrecord', '--bit-rate', '8000000', '--time-limit', '175', remote], { stdio: 'ignore' })
  await sleep(1500)
  const tour = spawn('maestro', ['test', '--platform', 'android', '-e', `APP_ID=${APP_ID}`, '.maestro/demo/tour.yaml'], { cwd: ROOT, stdio: 'inherit' })
  spawn('adb', ['shell', 'pkill', '-INT', 'screenrecord']) // SIGINT finalises the mp4
  await new Promise(resolve => recorder.once('exit', resolve))
  await sleep(1500)
  if (tour.status !== 0)
    fail('The tour flow failed — fix it (or the app) before recording. Nothing was changed.')
  fs.mkdirSync(path.dirname(RAW), { recursive: true })
  if (spawn('adb', ['pull', remote, RAW], { stdio: 'inherit' }).status !== 0)
    fail('Could not pull the recording from the device.')
}

async function recordIos(): Promise<void> {
  if (process.platform !== 'darwin')
    fail('iOS recording needs the iOS Simulator (macOS).')
  fs.mkdirSync(path.dirname(RAW), { recursive: true })
  console.log('● Recording the booted Simulator…')
  const recorder = spawnAsync('xcrun', ['simctl', 'io', 'booted', 'recordVideo', '--codec', 'h264', '--force', RAW], { stdio: 'ignore' })
  await sleep(1500)
  const tour = spawn('maestro', ['test', '--platform', 'ios', '-e', `APP_ID=${APP_ID}`, '.maestro/demo/tour.yaml'], { cwd: ROOT, stdio: 'inherit' })
  recorder.kill('SIGINT')
  await new Promise(resolve => recorder.once('exit', resolve))
  if (tour.status !== 0)
    fail('The tour flow failed — fix it (or the app) before recording. Nothing was changed.')
}

/** Two-pass palette GIF; shrinks width/fps until it fits GitHub's inline limit. */
function encode(): { width: number, fps: number } {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  if (spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', RAW, '-vf', 'scale=540:-2', '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', MP4]).status !== 0)
    fail('ffmpeg could not encode the MP4.')
  let width = WIDTH
  let fps = FPS
  for (let attempt = 0; attempt < 5; attempt++) {
    const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`
    if (spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', RAW, '-vf', filter, '-loop', '0', GIF]).status !== 0)
      fail('ffmpeg could not encode the GIF.')
    if (fs.statSync(GIF).size <= MAX_GIF_BYTES)
      return { width, fps }
    width = Math.round(width * 0.85)
    fps = Math.max(8, fps - 2)
    console.log(`  GIF over ${MAX_GIF_BYTES / 1024 / 1024} MB — retrying at ${width}px / ${fps} fps`)
  }
  return { width, fps }
}

function updateReadme(): void {
  const readme = path.join(ROOT, 'README.md')
  const raw = fs.readFileSync(readme, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const text = raw.replace(/\r\n/g, '\n')
  const start = '<!-- demo:start -->'
  const end = '<!-- demo:end -->'
  const from = text.indexOf(start)
  const to = text.indexOf(end)
  if (from < 0 || to < from)
    fail(`README.md has no ${start} … ${end} block.`)
  const date = new Date().toISOString().slice(0, 10)
  const body = [
    '<p align="center">',
    `  <img src="docs/assets/demo.gif" width="300" alt="App tour: onboarding, login, home, tabs and drawer" />`,
    '</p>',
    '',
    `<p align="center"><sub>Recorded ${date} on ${PLATFORM === 'ios' ? 'iOS Simulator' : 'Android'} · v${pkg.version} · <a href="docs/assets/demo.mp4">full-quality MP4</a> · regenerate with <code>pnpm run demo:record</code></sub></p>`,
  ].join('\n')
  fs.writeFileSync(readme, `${text.slice(0, from + start.length)}\n${body}\n${text.slice(to)}`.replace(/\n/g, eol))
}

async function main(): Promise<void> {
  need('ffmpeg', ['-version'], 'install it (winget install ffmpeg / brew install ffmpeg / apt install ffmpeg).')
  if (!argv.includes('--skip-record')) {
    need('maestro', ['--version'], 'install it from https://docs.maestro.dev/getting-started/installing-maestro')
    if (PLATFORM === 'android') {
      const devices = spawn('adb', ['devices']).stdout.split('\n').filter(l => /\tdevice$/.test(l.trim()) || /\tdevice\r?$/.test(l))
      if (devices.length === 0)
        fail('No Android device or emulator connected (adb devices).')
      await recordAndroid()
    }
    else {
      await recordIos()
    }
  }
  else if (!fs.existsSync(RAW)) {
    fail(`No previous recording at ${path.relative(ROOT, RAW)}.`)
  }
  const { width, fps } = encode()
  updateReadme()
  const mb = (file: string) => (fs.statSync(file).size / 1024 / 1024).toFixed(1)
  console.log(`\n✔ ${path.relative(ROOT, GIF)} (${mb(GIF)} MB, ${width}px @ ${fps} fps) · ${path.relative(ROOT, MP4)} (${mb(MP4)} MB) · README demo updated`)
}

await main()
