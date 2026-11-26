#!/usr/bin/env node
/// <reference types="node" />
/**
 * Optimizes the app's images in place — smaller bundle, faster first paint.
 *
 * Lossless by default: format and pixel dimensions never change, so nothing
 * that references an asset needs to be touched. A file is only rewritten when
 * the result is at least MIN_SAVING smaller, which keeps the script idempotent:
 * a second run finds nothing to do, and that is what `--check` asserts in CI.
 *
 *   .png         sharp, zlib level 9 + adaptive filtering, metadata stripped
 *                (--lossy: palette quantization, usually 50–70% smaller)
 *   .jpg/.jpeg   sharp mozjpeg, progressive, metadata stripped (quality --quality, default 82)
 *   .webp        sharp, effort 6 (quality --quality, default 80; lossless if the source is)
 *   .svg         svgo 4 preset-default (keeps viewBox, which react-native-svg needs)
 *
 * Usage:
 *   pnpm run images:optimize                         # everything under assets/
 *   pnpm run images:optimize -- assets/images/logo.png assets/icons
 *   pnpm run images:optimize -- --lossy              # also quantize PNGs
 *   pnpm run images:optimize -- --max-size 2048      # also cap the longest edge (px)
 *   pnpm run images:optimize -- --dry-run            # report only
 *   pnpm run images:check                            # exit 1 if any file would shrink
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import { optimize as optimizeSvg } from 'svgo'

type Options = {
  targets: string[]
  check: boolean
  dryRun: boolean
  lossy: boolean
  quality?: number
  maxSize?: number
}

type Result = {
  file: string
  before: number
  after: number
  written: boolean
}

const ROOT = process.cwd()
const DEFAULT_TARGETS = ['assets']
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg'])
const IGNORED_DIRS = new Set(['node_modules', '.git', 'android', 'ios', 'dist', 'build'])
/** Below this relative saving the file is left alone (avoids churn on re-runs). */
const MIN_SAVING = 0.02
/** …and below this absolute saving too. */
const MIN_SAVING_BYTES = 512

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

function parseNumber(flag: string, value: string | undefined): number {
  const n = Number(value)
  if (!value || !Number.isFinite(n) || n <= 0)
    fail(`${flag} needs a positive number`)
  return n
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { targets: [], check: false, dryRun: false, lossy: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--')
      continue
    if (arg === '--check')
      opts.check = true
    else if (arg === '--dry-run')
      opts.dryRun = true
    else if (arg === '--lossy')
      opts.lossy = true
    else if (arg === '--quality')
      opts.quality = Math.min(100, parseNumber(arg, argv[++i]))
    else if (arg === '--max-size')
      opts.maxSize = parseNumber(arg, argv[++i])
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: optimize-images [paths…] [--check] [--dry-run] [--lossy] [--quality <1-100>] [--max-size <px>]')
      process.exit(0)
    }
    else if (arg.startsWith('--'))
      fail(`Unknown option: ${arg}`)
    else
      opts.targets.push(arg)
  }
  if (opts.targets.length === 0)
    opts.targets = DEFAULT_TARGETS
  return opts
}

function collect(target: string, out: string[]): void {
  const abs = path.resolve(ROOT, target)
  if (!fs.existsSync(abs))
    fail(`Not found: ${target}`)
  const stat = fs.statSync(abs)
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(abs).toLowerCase()))
      out.push(abs)
    return
  }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name))
      continue
    collect(path.join(abs, entry.name), out)
  }
}

async function optimizeRaster(input: Buffer, ext: string, opts: Options): Promise<Buffer> {
  let pipeline = sharp(input, { failOn: 'none' }).rotate() // bake EXIF orientation, then drop EXIF
  if (opts.maxSize) {
    pipeline = pipeline.resize({ width: opts.maxSize, height: opts.maxSize, fit: 'inside', withoutEnlargement: true })
  }
  if (ext === '.png') {
    // NB: sharp's `effort` implies `palette: true` (quantization) — only pass it
    // in --lossy mode, or "lossless" output silently loses colours.
    return pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      ...(opts.lossy ? { palette: true, effort: 10, quality: opts.quality ?? 90 } : {}),
    }).toBuffer()
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return pipeline.jpeg({ quality: opts.quality ?? 82, mozjpeg: true, progressive: true }).toBuffer()
  }
  // .webp — keep lossless sources lossless unless the caller asked for lossy.
  const meta = await sharp(input).metadata()
  const lossless = !opts.lossy && (meta as { isLossless?: boolean }).isLossless === true
  return pipeline.webp({ effort: 6, ...(lossless ? { lossless: true } : { quality: opts.quality ?? 80 }) }).toBuffer()
}

function optimizeVector(input: Buffer, file: string): Buffer {
  const result = optimizeSvg(input.toString('utf8'), {
    path: file,
    multipass: true,
    // SVGO 4's preset-default keeps viewBox (react-native-svg needs it to scale).
    plugins: ['preset-default'],
  })
  return Buffer.from(result.data, 'utf8')
}

/** Lossless PNG/WebP must decode to exactly the same RGBA pixels as the source. */
async function samePixels(a: Buffer, b: Buffer): Promise<boolean> {
  const [left, right] = await Promise.all([a, b].map(buf => sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })))
  return left.info.width === right.info.width
    && left.info.height === right.info.height
    && left.data.equals(right.data)
}

function isLosslessFormat(ext: string, opts: Options): boolean {
  return !opts.lossy && !opts.maxSize && (ext === '.png' || ext === '.webp')
}

async function processFile(file: string, opts: Options): Promise<Result> {
  const input = fs.readFileSync(file)
  const ext = path.extname(file).toLowerCase()
  const output = ext === '.svg' ? optimizeVector(input, file) : await optimizeRaster(input, ext, opts)
  const saving = input.length - output.length
  let worthIt = saving >= MIN_SAVING_BYTES && saving / input.length >= MIN_SAVING
  if (worthIt && isLosslessFormat(ext, opts) && !(await samePixels(input, output))) {
    console.warn(`⚠ ${path.relative(ROOT, file)}: re-encode changed pixels — left untouched (use --lossy to accept that).`)
    worthIt = false
  }
  const shouldWrite = worthIt && !opts.check && !opts.dryRun
  if (shouldWrite) {
    const tmp = `${file}.tmp-optimize`
    fs.writeFileSync(tmp, output)
    fs.renameSync(tmp, file)
  }
  return { file, before: input.length, after: worthIt ? output.length : input.length, written: shouldWrite }
}

/** Images processed at the same time — see main(). */
const IMAGE_CONCURRENCY = 4

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))
  const files: string[] = []
  for (const target of opts.targets)
    collect(target, files)
  if (files.length === 0) {
    console.log('No images found.')
    return
  }

  // Each file is read, encoded and replaced on its own (temp file + rename),
  // so files can run side by side. Bounded: sharp already spreads one image
  // over libvips threads, and unbounded parallelism would hold every decoded
  // image in memory at once. Results keep the input order.
  const slots: (Result | null)[] = Array.from({ length: files.length }, () => null)
  let next = 0
  const worker = async (): Promise<void> => {
    while (next < files.length) {
      const index = next++
      const file = files[index]
      try {
        slots[index] = await processFile(file, opts)
      }
      catch (error) {
        console.warn(`⚠ Skipped ${path.relative(ROOT, file)}: ${(error as Error).message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(IMAGE_CONCURRENCY, files.length) }, worker))
  const results = slots.filter((r): r is Result => r !== null)

  const shrinkable = results.filter(r => r.after < r.before)
  for (const r of shrinkable) {
    const pct = (((r.before - r.after) / r.before) * 100).toFixed(1)
    const verb = r.written ? 'optimized' : 'could save'
    console.log(`${verb.padEnd(11)} ${path.relative(ROOT, r.file).padEnd(48)} ${kb(r.before).padStart(10)} → ${kb(r.after).padStart(10)}  (-${pct}%)`)
  }

  const before = results.reduce((sum, r) => sum + r.before, 0)
  const after = results.reduce((sum, r) => sum + r.after, 0)
  console.log(`\n${results.length} image(s) scanned · ${shrinkable.length} shrinkable · ${kb(before)} → ${kb(after)} (-${kb(before - after)})`)

  if (opts.check && shrinkable.length > 0) {
    console.error('\n✖ Some images are not optimized. Run `pnpm run images:optimize` and commit the result.')
    process.exitCode = 1
  }
}

await main()
