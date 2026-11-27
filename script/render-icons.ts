#!/usr/bin/env node
/// <reference types="node" />
/**
 * Renders every app icon and splash image from `assets/brand/icon.svg`.
 *
 *   pnpm run icons            write all PNGs (then `pnpm run images:optimize`)
 *   pnpm run icons -- --check fail if a committed PNG differs from a fresh render
 *   pnpm run icons -- --list  print each output and what uses it
 *
 * Change the brand by editing the SVG, never the PNGs: the variants (opaque
 * iOS icon, Android adaptive foreground inside the 66/108 safe circle, light
 * and dark splash, favicon, white notification silhouette) are defined in
 * script/lib/icon-variants.ts. Icons are native config — after changing them,
 * bump `version` and rebuild (CLAUDE.md rule 7).
 *
 * Ported from clocknet tools/brand/render_icons.py (sharp instead of Python:
 * sharp is already a devDependency and rasterises SVG itself).
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import { ICON_SOURCE, ICON_VARIANTS, type IconVariant, variantSvg } from './lib/icon-variants.ts'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
// Per-channel difference allowed in --check: libvips/librsvg versions may
// antialias an edge one or two levels differently.
const TOLERANCE = 8

async function render(source: string, variant: IconVariant): Promise<Buffer> {
  const svg = Buffer.from(variantSvg(source, variant))
  if (!variant.trimToMark)
    return sharp(svg).png().toBuffer()
  // Render big, crop to the mark's pixels, then fit it with padding.
  const big = await sharp(Buffer.from(variantSvg(source, { ...variant, size: 1024, trimToMark: undefined }))).png().toBuffer()
  const mark = await sharp(big).trim().toBuffer()
  const inner = variant.size - 2 * variant.trimToMark.padding
  return sharp(mark)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: variant.trimToMark.padding, bottom: variant.trimToMark.padding, left: variant.trimToMark.padding, right: variant.trimToMark.padding, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

/** Largest per-channel difference between two PNGs of the same size, or Infinity if sizes differ. */
async function maxDiff(a: Buffer, b: Buffer): Promise<number> {
  const [ra, rb] = await Promise.all([a, b].map(img => sharp(img).ensureAlpha().raw().toBuffer({ resolveWithObject: true })))
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height)
    return Infinity
  let max = 0
  for (let i = 0; i < ra.data.length; i++) {
    const d = Math.abs(ra.data[i] - rb.data[i])
    if (d > max)
      max = d
  }
  return max
}

async function main(): Promise<void> {
  if (args.includes('--list')) {
    for (const v of ICON_VARIANTS)
      console.log(`${v.file.padEnd(40)} ${String(v.size).padStart(4)} px  ${v.usedBy}`)
    return
  }
  const source = fs.readFileSync(path.join(ROOT, ICON_SOURCE), 'utf8')
  const stale: string[] = []
  for (const variant of ICON_VARIANTS) {
    const png = await render(source, variant)
    const out = path.join(ROOT, variant.file)
    if (CHECK) {
      const diff = fs.existsSync(out) ? await maxDiff(png, fs.readFileSync(out)) : Infinity
      if (diff > TOLERANCE)
        stale.push(`${variant.file} (${diff === Infinity ? 'missing or wrong size' : `max channel diff ${diff}`})`)
      continue
    }
    fs.writeFileSync(out, png)
    console.log(`✔ ${variant.file} (${variant.size}px)`)
  }
  if (stale.length > 0) {
    console.error(`✖ Icons out of date with ${ICON_SOURCE}:\n  ${stale.join('\n  ')}\nRun \`pnpm run icons\` and commit the PNGs.`)
    process.exitCode = 1
  }
  else if (CHECK) {
    console.log(`✔ ${ICON_VARIANTS.length} icons match ${ICON_SOURCE}`)
  }
}

await main()
