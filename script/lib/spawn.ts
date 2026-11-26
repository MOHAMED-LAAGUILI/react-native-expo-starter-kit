/// <reference types="node" />
/**
 * `spawnSync` that works the same on every OS.
 *
 * Windows needs `shell: true` to run `.cmd` shims (pnpm, npm, npx, gradlew.bat)
 * — Node refuses to spawn them directly since the 2024 CVE fix. But passing an
 * args array together with `shell: true` makes Node 24 print DEP0190, because
 * it only concatenates them. So on Windows we build the command line ourselves,
 * quoting anything with spaces or shell metacharacters; elsewhere we spawn
 * without a shell.
 *
 * Only for commands this repo's scripts construct — never for user input.
 */

import type { SpawnSyncOptions, SpawnSyncReturns } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const IS_WINDOWS = process.platform === 'win32'

function quote(arg: string): string {
  return /[\s"&|<>^]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg
}

export function spawn(command: string, args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
  const opts = { encoding: 'utf8' as const, ...options }
  if (IS_WINDOWS)
    return spawnSync([command, ...args].map(quote).join(' '), { ...opts, shell: true }) as SpawnSyncReturns<string>
  return spawnSync(command, args, { ...opts, shell: false }) as SpawnSyncReturns<string>
}
