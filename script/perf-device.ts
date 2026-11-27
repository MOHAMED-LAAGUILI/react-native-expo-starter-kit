#!/usr/bin/env node
/// <reference types="node" />
/**
 * Measures the app on a real Android device or emulator over adb. Read-only on
 * the app's data: it never installs, signs in or taps anything.
 *
 *   pnpm run perf:device                       cold start, 5 runs (default)
 *   pnpm run perf:device -- cold-start --runs 10
 *   pnpm run perf:device -- sample -m 20 -i 60 [--smaps]
 *
 * cold-start  force-stops the app and launches it with `am start -W`, N times;
 *             prints TotalTime (launch → first frame) per run and the median.
 *             Measure a release build (`pnpm run build:local:install`): a dev
 *             client's first frame is its launcher, not the app, and it loads
 *             JS from Metro.
 * sample      leave the app where you want it, then sample every -i seconds
 *             for -m minutes: CPU % (from /proc/<pid>/stat), top's RES, the
 *             meminfo App Summary, frames drawn per interval and the busiest
 *             threads. Writes summary.csv, threads.txt, events.txt and raw/
 *             dumps. Exit 2 if the process died or restarted during the run.
 *
 * Common options:
 *   -s SERIAL    adb device (default: $ANDROID_SERIAL, or the only device)
 *   -p PACKAGE   default com.rntemplate.app (one id for every build profile)
 *   -o OUT_DIR   default <tmp>/rn-starter-perf/<mode>-<timestamp>
 *
 * Reading `sample` output: thread `mqt_v_js`/`mqt_js` is the JS thread (React
 * renders, queries), the thread named like the package is the UI thread
 * (Fabric mounts, Reanimated), `RenderThread` is drawing. ~60 frames/s while
 * idle means an animation that never stops. Growth in Native Heap / Private
 * Other is Hermes or native-module memory, Graphics is GPU buffers.
 *
 * Ported from clocknet tools/perf/idle-clocked-in-sample.sh.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  busiestThreads,
  cpuPercent,
  cpuTicks,
  framesRendered,
  meminfoKb,
  parseAmStart,
  summarize,
  topRow,
} from './lib/device-perf.ts'
import { spawn } from './lib/spawn.ts'

const argv = process.argv.slice(2)
const mode = argv[0] && !argv[0].startsWith('-') ? argv.shift()! : 'cold-start'
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

if (argv.includes('-h') || argv.includes('--help')) {
  const text = fs.readFileSync(new URL(import.meta.url), 'utf8')
  console.log(text.split('*/')[0].replace(/^#!.*\n\/\/\/.*\n\/\*\*\n/, '').replace(/^ \* ?/gm, ''))
  process.exit(0)
}

const PKG = opt('-p', 'com.rntemplate.app')
const SERIAL = opt('-s', process.env.ANDROID_SERIAL ?? '')
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const OUT = opt('-o', path.join(os.tmpdir(), 'rn-starter-perf', `${mode}-${STAMP}`))

function adb(args: string[]): string {
  const result = spawn('adb', [...(SERIAL ? ['-s', SERIAL] : []), ...args])
  if (result.error)
    throw new Error(`adb not found — install Android platform-tools (pnpm run setup:check --android)`)
  return (result.stdout ?? '').replace(/\r/g, '')
}
const sh = (...args: string[]) => adb(['shell', ...args])
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const pidOf = () => sh('pidof', PKG).trim().split(/\s+/)[0] ?? ''

function requireDevice(): void {
  const devices = adb(['devices']).split('\n').slice(1).filter(l => /\tdevice$/.test(l))
  if (devices.length === 0) {
    console.error('✖ No adb device. Connect a phone with USB debugging or start an emulator.')
    process.exit(1)
  }
  if (devices.length > 1 && !SERIAL) {
    console.error(`✖ ${devices.length} devices connected — pick one with -s <serial> or ANDROID_SERIAL.`)
    process.exit(1)
  }
  if (!sh('pm', 'path', PKG).includes('package:')) {
    console.error(`✖ ${PKG} is not installed on the device. Build one: pnpm run build:local:install`)
    process.exit(1)
  }
}

function coldStart(): void {
  const runs = Number(opt('--runs', '5'))
  const component = sh('cmd', 'package', 'resolve-activity', '--brief', PKG).trim().split('\n').pop() ?? ''
  if (!component.includes('/')) {
    console.error(`✖ Could not resolve the launcher activity of ${PKG}.`)
    process.exit(1)
  }
  const debuggable = sh('dumpsys', 'package', PKG).includes('DEBUGGABLE')
  if (debuggable)
    console.warn('⚠ Debuggable build (dev client): the numbers include the dev launcher and Metro. Use a release build for real figures.')

  const totals: (number | null)[] = []
  for (let run = 1; run <= runs; run++) {
    sh('am', 'force-stop', PKG)
    sleep(1500)
    const result = parseAmStart(sh('am', 'start', '-W', '-n', component))
    totals.push(result.totalMs)
    console.log(`run ${String(run).padStart(2)}  TotalTime ${result.totalMs ?? '?'} ms  WaitTime ${result.waitMs ?? '?'} ms  ${result.launchState ?? ''}`)
    sleep(3000) // let it settle before the next force-stop
  }
  const stats = summarize(totals)
  if (!stats) {
    console.error('✖ am start -W reported no TotalTime.')
    process.exit(1)
  }
  console.log(`\ncold start (${PKG}, ${stats.n} runs): median ${stats.median} ms · min ${stats.min} · max ${stats.max}`)
  console.log('TotalTime ends at the first frame Android draws; the splash screen stays up until fonts, i18n and stores load (app/_layout.tsx).')
}

function sample(): number {
  const minutes = Number(opt('-m', '20'))
  const interval = Number(opt('-i', '60'))
  const smaps = argv.includes('--smaps')
  const pid = pidOf()
  if (!pid) {
    console.error(`✖ ${PKG} is not running — open the app and leave it on the screen to measure.`)
    process.exit(1)
  }
  fs.mkdirSync(path.join(OUT, 'raw'), { recursive: true })
  const clkTck = Number(sh('getconf', 'CLK_TCK').trim()) || 100
  const samples = Math.floor((minutes * 60) / interval)
  const header = [
    `package=${PKG} pid=${pid} minutes=${minutes} interval=${interval}s clk_tck=${clkTck}`,
    `device=${sh('getprop', 'ro.product.model').trim()} sdk=${sh('getprop', 'ro.build.version.sdk').trim()}`,
    `started=${new Date().toISOString()}`,
  ].join('\n')
  fs.writeFileSync(path.join(OUT, 'run.txt'), `${header}\n`)
  console.log(header)

  const csv = path.join(OUT, 'summary.csv')
  fs.writeFileSync(csv, 'time_utc,minute,pid,cpu_avg_pct,top_cpu_pct,top_res,pss_total_kb,java_heap_kb,native_heap_kb,graphics_kb,private_other_kb,frames_in_interval\n')
  fs.writeFileSync(path.join(OUT, 'threads.txt'), '')

  const start = Date.now()
  let prevTicks = cpuTicks(sh('cat', `/proc/${pid}/stat`))
  let prevAt = Date.now()
  let prevFrames: number | null = null
  let status = 0

  for (let n = 0; n <= samples; n++) {
    const tag = String(n).padStart(3, '0')
    const now = pidOf()
    if (now !== pid) {
      const line = `${new Date().toISOString()} process gone or restarted (was ${pid}, now '${now || 'none'}')`
      fs.appendFileSync(path.join(OUT, 'run.txt'), `${line}\n`)
      console.log(line)
      status = 2
      break
    }
    const top = sh('top', '-b', '-n', '1', '-p', pid)
    const threads = sh('top', '-H', '-b', '-n', '1', '-p', pid)
    const meminfo = sh('dumpsys', 'meminfo', PKG)
    const gfx = sh('dumpsys', 'gfxinfo', PKG)
    for (const [name, text] of [['top', top], ['threads', threads], ['meminfo', meminfo], ['gfxinfo', gfx]] as const)
      fs.writeFileSync(path.join(OUT, 'raw', `${tag}-${name}.txt`), text)

    const ticks = cpuTicks(sh('cat', `/proc/${pid}/stat`))
    const at = Date.now()
    const cpuAvg = n > 0 && ticks !== null && prevTicks !== null ? cpuPercent(ticks - prevTicks, clkTck, (at - prevAt) / 1000) : null
    prevTicks = ticks
    prevAt = at
    const frames = framesRendered(gfx)
    const framesDelta = frames !== null && prevFrames !== null ? frames - prevFrames : null
    prevFrames = frames
    const row = topRow(top, pid)

    const cells = [
      new Date().toISOString().slice(11, 19),
      ((at - start) / 60000).toFixed(1),
      pid,
      cpuAvg ?? '',
      row?.cpu ?? '',
      row?.res ?? '',
      meminfoKb(meminfo, 'TOTAL PSS:') ?? '',
      meminfoKb(meminfo, 'Java Heap:') ?? '',
      meminfoKb(meminfo, 'Native Heap:') ?? '',
      meminfoKb(meminfo, 'Graphics:') ?? '',
      meminfoKb(meminfo, 'Private Other:') ?? '',
      framesDelta ?? '',
    ].join(',')
    fs.appendFileSync(csv, `${cells}\n`)
    fs.appendFileSync(path.join(OUT, 'threads.txt'), `${tag} ${busiestThreads(threads).join(' | ')}\n`)
    console.log(cells)

    if (smaps && n % 5 === 0) {
      // Rss per mapping name; needs run-as, so a debuggable build.
      const rss = new Map<string, number>()
      let name = '[anon]'
      for (const line of sh('run-as', PKG, 'cat', `/proc/${pid}/smaps`).split('\n')) {
        if (/^[0-9a-f]+-[0-9a-f]+ /.test(line))
          name = line.trim().split(/\s+/)[5] ?? '[anon]'
        const m = line.match(/^Rss:\s+(\d+)/)
        if (m)
          rss.set(name, (rss.get(name) ?? 0) + Number(m[1]))
      }
      const topMaps = [...rss].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${v} ${k}`)
      fs.writeFileSync(path.join(OUT, 'raw', `${tag}-smaps.txt`), `${topMaps.join('\n')}\n`)
    }
    if (n < samples)
      sleep(interval * 1000)
  }

  const events = adb(['logcat', '-b', 'events', '-d']).split('\n').filter(l => /am_(anr|kill|proc_died|proc_start)/.test(l) && l.includes(PKG))
  fs.writeFileSync(path.join(OUT, 'events.txt'), `${events.join('\n')}\n`)
  console.log(`done: ${OUT} (exit ${status})`)
  return status
}

requireDevice()
if (mode === 'cold-start') {
  coldStart()
}
else if (mode === 'sample') {
  process.exit(sample())
}
else {
  console.error(`✖ Unknown mode "${mode}" — use cold-start or sample (--help).`)
  process.exit(64)
}
