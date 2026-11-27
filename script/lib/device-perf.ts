/// <reference types="node" />
/**
 * Parsers for `pnpm run perf:device` (script/perf-device.ts), kept free of adb
 * so they can be unit-tested against captured output.
 *
 * Ported from clocknet's tools/perf/idle-clocked-in-sample.sh.
 */

/** utime + stime of a process, in clock ticks (fields 14 and 15 of /proc/<pid>/stat). */
export function cpuTicks(stat: string): number | null {
  // Field 2 is "(comm)" and may contain spaces: count fields after the last ')'.
  const close = stat.lastIndexOf(')')
  if (close < 0)
    return null
  const rest = stat.slice(close + 2).trim().split(/\s+/)
  // rest[0] is field 3, so field N is rest[N - 3].
  const utime = Number(rest[11])
  const stime = Number(rest[12])
  return Number.isFinite(utime) && Number.isFinite(stime) ? utime + stime : null
}

/** Average CPU % of one core over an interval, from two tick readings. */
export function cpuPercent(ticksDelta: number, clkTck: number, seconds: number): number | null {
  if (seconds <= 0 || clkTck <= 0)
    return null
  return Math.round((1000 * ticksDelta) / clkTck / seconds) / 10
}

/** First number after a label in `dumpsys meminfo` ("Java Heap:   12345"), in KB. */
export function meminfoKb(meminfo: string, label: string): number | null {
  for (const line of meminfo.split(/\r?\n/)) {
    const at = line.indexOf(label)
    if (at < 0)
      continue
    const m = line.slice(at + label.length).match(/-?\d+/)
    return m ? Number(m[0]) : null
  }
  return null
}

/** "Total frames rendered: 1234" from `dumpsys gfxinfo`. */
export function framesRendered(gfxinfo: string): number | null {
  const m = gfxinfo.match(/Total frames rendered:\s*(\d+)/)
  return m ? Number(m[1]) : null
}

/** RES and %CPU of `pid` from toybox `top -b -n 1` (PID USER PR NI VIRT RES SHR S %CPU …). */
export function topRow(top: string, pid: string): { res: string, cpu: string } | null {
  for (const line of top.split(/\r?\n/)) {
    const cols = line.trim().split(/\s+/)
    if (cols[0] === pid && cols.length >= 9)
      return { res: cols[5], cpu: cols[8] }
  }
  return null
}

/** The `count` busiest threads from `top -H -b -n 1`, as "12.3% mqt_v_js". */
export function busiestThreads(topThreads: string, count = 3): string[] {
  const rows: { cpu: number, name: string }[] = []
  let inTable = false
  for (const line of topThreads.split(/\r?\n/)) {
    if (/%CPU/.test(line)) {
      inTable = true
      continue
    }
    const cols = line.trim().split(/\s+/)
    if (!inTable || cols.length < 12)
      continue
    const cpu = Number(cols[8])
    if (Number.isFinite(cpu))
      rows.push({ cpu, name: cols.slice(11).join(' ') })
  }
  return rows.sort((a, b) => b.cpu - a.cpu).slice(0, count).map(r => `${r.cpu}% ${r.name}`)
}

/** TotalTime / WaitTime (ms) and launch state from `am start -W`. */
export function parseAmStart(output: string): { totalMs: number | null, waitMs: number | null, launchState: string | null } {
  const num = (label: string) => {
    const m = output.match(new RegExp(`${label}:\\s*(\\d+)`))
    return m ? Number(m[1]) : null
  }
  const state = output.match(/LaunchState:\s*(\w+)/)
  return { totalMs: num('TotalTime'), waitMs: num('WaitTime'), launchState: state ? state[1] : null }
}

/** Median, min and max of the numbers given (nulls ignored). */
export function summarize(values: (number | null)[]): { median: number, min: number, max: number, n: number } | null {
  const xs = values.filter((v): v is number => typeof v === 'number').sort((a, b) => a - b)
  if (xs.length === 0)
    return null
  const mid = Math.floor(xs.length / 2)
  const median = xs.length % 2 ? xs[mid] : Math.round((xs[mid - 1] + xs[mid]) / 2)
  return { median, min: xs[0], max: xs[xs.length - 1], n: xs.length }
}
