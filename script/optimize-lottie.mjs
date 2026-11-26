#!/usr/bin/env node
// Shrink bundled Lottie JSON without changing what it draws.
//
// Usage (from mobile/):
//   pnpm run lottie:optimize -- assets/lottie/new-file.json            # rewrite in place, 3 decimals
//   pnpm run lottie:optimize -- --precision=2 assets/lottie/a.json     # coarser geometry
//   pnpm run lottie:optimize -- --check assets/lottie/*.json           # exit 1 if a file would change
//   add --dry-run to print the sizes without writing.
//
// Node built-ins only: no runtime or dev dependency. What it does, and why each
// step is safe on lottie-web, lottie-ios and lottie-android (SPEC_15 §3.16):
//
// - Minify: no whitespace.
// - Round numbers. Geometry, transforms, opacity and other values go to
//   `--precision` decimals (default 3, never below 2). Colours (fill, stroke,
//   gradient and text colours, 0-1 channels) and keyframe easing handles
//   (`i`/`o` objects) keep at least 3, so no colour or curve shifts. Timing is
//   never touched: `t`, `ip`, `op`, `st`, `sr`, `fr`, `tm`, `w` and `h` keep
//   their exact values.
// - Drop what the players never read: the root `meta` block, `mn` (After Effects
//   match names), `ix` (property indexes) outside effects, `hd: false` and a
//   layer's `ddd: 0` (both defaults; the root `ddd` stays). `mn` and `ix` stay in a file that carries an
//   expression (`x`), since lottie-web's expressions look properties up by them.
//   `nm` always stays: the app's `colorFilters` keypaths and the tests find
//   layers, groups and fills by name.
// - Drop what never renders: shape items with `hd: true`, top-level layers with
//   `hd: true` or that end before the first frame / start after the last, and
//   assets no layer references. A layer something else needs (a `parent`, a
//   matte source `td`, a matte `tp`) is kept.
// - Re-encode embedded data-URI PNGs losslessly: decode, reduce the colour type
//   where every pixel survives (RGBA -> RGB, grey, or a palette), try every
//   filter strategy at zlib level 9, strip metadata chunks (text, time, pHYs,
//   bKGD), and keep the result only when it is smaller and decodes to the same
//   RGBA pixels. JPEGs and PNGs the decoder does not handle (16-bit, interlaced)
//   are left as they are.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TIMING_KEYS = new Set(['t', 'ip', 'op', 'st', 'sr', 'fr', 'tm', 'w', 'h']);
const MIN_PRECISION = 2;
const SAFE_PRECISION = 3;

// ---------------------------------------------------------------- numbers

function roundTo(value, decimals) {
  if (!Number.isFinite(value) || Number.isInteger(value)) return value;
  const f = 10 ** decimals;
  const r = Math.round(value * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

function roundTree(node, decimals, key) {
  if (typeof node === 'number') return roundTo(node, decimals);
  if (Array.isArray(node)) return node.map((v) => roundTree(v, decimals, key));
  if (node === null || typeof node !== 'object') return node;
  const out = {};
  const isColourShape = node.ty === 'fl' || node.ty === 'st' || node.ty === 'gf' || node.ty === 'gs';
  for (const [k, v] of Object.entries(node)) {
    // Timing stays exact; `tm` (time remap) is a whole property of seconds.
    if ((TIMING_KEYS.has(k) && typeof v === 'number') || k === 'tm') {
      out[k] = v;
      continue;
    }
    // Keyframe easing handles are { x, y } objects (shape tangents are arrays,
    // and opacity `o` is a { a, k } property).
    const easing =
      (k === 'i' || k === 'o') && v !== null && typeof v === 'object' && !Array.isArray(v) && 'x' in v && !('k' in v);
    const colour =
      (isColourShape && (k === 'c' || k === 'g')) || k === 'fc' || k === 'sc';
    const keep = easing || colour ? Math.max(decimals, SAFE_PRECISION) : decimals;
    out[k] = roundTree(v, keep, k);
  }
  return out;
}

// ---------------------------------------------------------------- structure

function hasExpression(node) {
  if (Array.isArray(node)) return node.some(hasExpression);
  if (node === null || typeof node !== 'object') return false;
  if (typeof node.x === 'string' && 'k' in node) return true;
  return Object.values(node).some(hasExpression);
}

function stripFields(node, keepExprFields, inEffect = false) {
  if (Array.isArray(node)) {
    return node
      .filter((item) => !(item && typeof item === 'object' && item.hd === true && typeof item.ty === 'string'))
      .map((item) => stripFields(item, keepExprFields, inEffect));
  }
  if (node === null || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === 'hd' && v === false) continue;
    if (k === 'ddd' && v === 0) continue;
    if (!keepExprFields && k === 'mn') continue;
    if (!keepExprFields && !inEffect && k === 'ix' && typeof v === 'number') continue;
    out[k] = stripFields(v, keepExprFields, inEffect || k === 'ef');
  }
  return out;
}

function pruneLayers(layers, compIp, compOp, isRoot) {
  const needed = new Set();
  layers.forEach((layer, i) => {
    if (layer.parent !== undefined) needed.add(layer.parent);
    if (layer.tp !== undefined) needed.add(layer.tp);
    // Legacy mattes: a layer with `tt` uses the layer right above it.
    if (layer.tt && i > 0 && layers[i - 1].ind !== undefined) needed.add(layers[i - 1].ind);
  });
  return layers.filter((layer) => {
    if (needed.has(layer.ind) || layer.td) return true;
    if (layer.hd === true) return false;
    // Only the root timeline is known for sure; a precomp may be time-remapped.
    if (isRoot && (layer.op <= compIp || layer.ip >= compOp)) return false;
    return true;
  });
}

function pruneAssets(anim) {
  const assets = anim.assets ?? [];
  const byId = new Map(assets.map((a) => [a.id, a]));
  const used = new Set();
  const visit = (layers) => {
    for (const layer of layers ?? []) {
      if (layer.refId === undefined || used.has(layer.refId)) continue;
      used.add(layer.refId);
      visit(byId.get(layer.refId)?.layers);
    }
  };
  visit(anim.layers);
  anim.assets = assets.filter((a) => used.has(a.id));
}

// ---------------------------------------------------------------- PNG

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const KEEP_CHUNKS = new Set(['gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT']);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function readChunks(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) return null;
  const chunks = [];
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    chunks.push({ type, data: buf.subarray(off + 8, off + 8 + len) });
    off += 12 + len;
    if (type === 'IEND') break;
  }
  return chunks;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** RGBA pixels of a non-interlaced PNG, or null when this decoder can't. */
function decodePng(buf) {
  const chunks = readChunks(buf);
  if (!chunks || chunks[0]?.type !== 'IHDR') return null;
  const ihdr = chunks[0].data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const depth = ihdr[8];
  const ct = ihdr[9];
  if (ihdr[12] !== 0 || !(ct in CHANNELS)) return null;
  if (ct === 3 ? ![1, 2, 4, 8].includes(depth) : depth !== 8) return null;
  if (chunks.some((c) => c.type === 'eXIf' || c.type === 'acTL')) return null;
  const plte = chunks.find((c) => c.type === 'PLTE')?.data;
  const trns = chunks.find((c) => c.type === 'tRNS')?.data;
  if (ct !== 3 && trns) return null; // colour-key transparency: leave it alone
  const raw = zlib.inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
  const bpp = Math.max(1, (CHANNELS[ct] * depth) >> 3);
  const stride = Math.ceil((width * CHANNELS[ct] * depth) / 8);
  if (raw.length < (stride + 1) * height) return null;
  const lines = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? lines[dst + x - bpp] : 0;
      const b = y > 0 ? lines[dst - stride + x] : 0;
      const c = x >= bpp && y > 0 ? lines[dst - stride + x - bpp] : 0;
      const v = raw[src + x];
      lines[dst + x] =
        f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b : f === 3 ? v + ((a + b) >> 1) : v + paeth(a, b, c);
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const row = y * stride;
      if (ct === 3) {
        const bit = x * depth;
        const idx = (lines[row + (bit >> 3)] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
        if (!plte || idx * 3 + 2 >= plte.length) return null;
        rgba[o] = plte[idx * 3];
        rgba[o + 1] = plte[idx * 3 + 1];
        rgba[o + 2] = plte[idx * 3 + 2];
        rgba[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      } else {
        const p = row + x * CHANNELS[ct];
        const gray = ct === 0 || ct === 4;
        rgba[o] = lines[p];
        rgba[o + 1] = gray ? lines[p] : lines[p + 1];
        rgba[o + 2] = gray ? lines[p] : lines[p + 2];
        rgba[o + 3] = ct === 6 ? lines[p + 3] : ct === 4 ? lines[p + 1] : 255;
      }
    }
  }
  return { width, height, rgba, kept: chunks.filter((c) => KEEP_CHUNKS.has(c.type)) };
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

/** Scanlines (without filter bytes) for each colour-type candidate. */
function candidates({ width, height, rgba }) {
  let opaque = true;
  let gray = true;
  const colours = new Map();
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] !== 255) opaque = false;
    if (rgba[i] !== rgba[i + 1] || rgba[i] !== rgba[i + 2]) gray = false;
    if (colours.size <= 256) colours.set(rgba.readUInt32BE(i), true);
  }
  const out = [];
  // With 16 colours or fewer a 1-4 bit palette always wins; skip the rest.
  const fewColours = colours.size <= 16;
  const pack = (ct, ch) => {
    const lines = Buffer.alloc(width * height * ch);
    for (let p = 0, q = 0; p < rgba.length; p += 4) {
      if (ch === 1) lines[q++] = rgba[p];
      else if (ch === 2) (lines[q++] = rgba[p]), (lines[q++] = rgba[p + 3]);
      else {
        lines[q++] = rgba[p];
        lines[q++] = rgba[p + 1];
        lines[q++] = rgba[p + 2];
        if (ch === 4) lines[q++] = rgba[p + 3];
      }
    }
    out.push({ ct, depth: 8, bpp: ch, stride: width * ch, lines, extra: [] });
  };
  if (gray && !fewColours) pack(opaque ? 0 : 4, opaque ? 1 : 2);
  if (!fewColours) pack(opaque ? 2 : 6, opaque ? 3 : 4);
  if (colours.size <= 256) {
    // Translucent entries first, so tRNS stays short.
    const list = [...colours.keys()].sort((a, b) => (a & 255) - (b & 255) || a - b);
    const index = new Map(list.map((c, i) => [c, i]));
    const depth = list.length <= 2 ? 1 : list.length <= 4 ? 2 : list.length <= 16 ? 4 : 8;
    const stride = Math.ceil((width * depth) / 8);
    const lines = Buffer.alloc(stride * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = index.get(rgba.readUInt32BE((y * width + x) * 4));
        const bit = x * depth;
        lines[y * stride + (bit >> 3)] |= idx << (8 - depth - (bit & 7));
      }
    }
    const plte = Buffer.alloc(list.length * 3);
    list.forEach((c, i) => {
      plte[i * 3] = c >>> 24;
      plte[i * 3 + 1] = (c >>> 16) & 255;
      plte[i * 3 + 2] = (c >>> 8) & 255;
    });
    const alphas = list.map((c) => c & 255);
    let last = alphas.length;
    while (last > 0 && alphas[last - 1] === 255) last--;
    const extra = [chunk('PLTE', plte)];
    if (last > 0) extra.push(chunk('tRNS', Buffer.from(alphas.slice(0, last))));
    out.push({ ct: 3, depth, bpp: 1, stride, lines, extra });
  }
  return out;
}

function filterLines({ lines, stride, bpp }, height, mode) {
  const out = Buffer.alloc((stride + 1) * height);
  const row = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const cur = y * stride;
    let best = null;
    let bestSum = Infinity;
    for (const f of mode === 'adaptive' ? [0, 1, 2, 3, 4] : [mode]) {
      let sum = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? lines[cur + x - bpp] : 0;
        const b = y > 0 ? lines[cur - stride + x] : 0;
        const c = x >= bpp && y > 0 ? lines[cur - stride + x - bpp] : 0;
        const v = lines[cur + x];
        const r =
          (f === 0 ? v : f === 1 ? v - a : f === 2 ? v - b : f === 3 ? v - ((a + b) >> 1) : v - paeth(a, b, c)) & 255;
        row[x] = r;
        sum += r < 128 ? r : 256 - r;
      }
      if (sum < bestSum) {
        bestSum = sum;
        best = { f, data: Buffer.from(row) };
      }
    }
    out[y * (stride + 1)] = best.f;
    best.data.copy(out, y * (stride + 1) + 1);
  }
  return out;
}

function encodePng(image, cand, filtered, strategy) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = cand.depth;
  ihdr[9] = cand.ct;
  const idat = zlib.deflateSync(filtered, { level: 9, memLevel: 9, strategy });
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    ...image.kept.map((c) => chunk(c.type, c.data)),
    ...cand.extra,
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** The smallest lossless re-encode of `buf`, or `buf` itself. */
export function optimizePng(buf) {
  const image = decodePng(buf);
  if (!image) return buf;
  let best = buf;
  for (const cand of candidates(image)) {
    const modes = cand.ct === 3 && cand.depth < 8 ? [0, 'adaptive'] : [0, 1, 2, 3, 4, 'adaptive'];
    for (const mode of modes) {
      const filtered = filterLines(cand, image.height, mode);
      for (const strategy of [zlib.constants.Z_DEFAULT_STRATEGY, zlib.constants.Z_FILTERED]) {
        const png = encodePng(image, cand, filtered, strategy);
        if (png.length < best.length) best = png;
      }
    }
  }
  if (best === buf) return buf;
  const check = decodePng(best);
  return check && check.rgba.equals(image.rgba) ? best : buf;
}

function optimizeImages(anim) {
  for (const asset of anim.assets ?? []) {
    const m = typeof asset.p === 'string' && /^data:image\/png;base64,(.*)$/s.exec(asset.p);
    if (!m) continue;
    const before = Buffer.from(m[1], 'base64');
    const after = optimizePng(before);
    if (after !== before) asset.p = `data:image/png;base64,${after.toString('base64')}`;
  }
}

// ---------------------------------------------------------------- entry

/** The optimised animation object; `anim` is not modified. */
export function optimizeLottie(anim, { precision = SAFE_PRECISION, images = true } = {}) {
  if (precision < MIN_PRECISION) throw new Error(`precision ${precision} is below ${MIN_PRECISION}`);
  const keepExprFields = hasExpression(anim);
  let out = structuredClone(anim);
  delete out.meta;
  out.layers = pruneLayers(out.layers ?? [], out.ip, out.op, true);
  for (const asset of out.assets ?? []) {
    if (asset.layers) asset.layers = pruneLayers(asset.layers, -Infinity, Infinity, false);
  }
  pruneAssets(out);
  const rootDdd = out.ddd;
  out = stripFields(out, keepExprFields);
  // The root `ddd` stays: it costs 8 bytes and lottie-ios reads it.
  if (rootDdd !== undefined) out.ddd = rootDdd;
  out = roundTree(out, precision);
  if (images) optimizeImages(out);
  return out;
}

export function optimizeLottieText(text, options) {
  return JSON.stringify(optimizeLottie(JSON.parse(text), options));
}

function main(argv) {
  const files = [];
  let precision = SAFE_PRECISION;
  let check = false;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--check') check = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--precision=')) precision = Number(arg.slice('--precision='.length));
    else files.push(arg);
  }
  if (files.length === 0) {
    console.error('usage: optimize-lottie.mjs [--precision=N] [--check] [--dry-run] <file.json...>');
    return 2;
  }
  let stale = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    const after = optimizeLottieText(before, { precision });
    const gz = (s) => zlib.gzipSync(s, { level: 9 }).length;
    const b = Buffer.byteLength(before);
    const a = Buffer.byteLength(after);
    totalBefore += b;
    totalAfter += a;
    const name = path.basename(file);
    if (check) {
      if (after !== before) {
        stale++;
        console.error(`${name}: not optimised (${b} -> ${a} bytes). Run: pnpm run lottie:optimize -- ${file}`);
      }
      continue;
    }
    console.log(`${name}: ${b} -> ${a} bytes (gzip ${gz(before)} -> ${gz(after)})`);
    if (!dryRun && after !== before) fs.writeFileSync(file, after);
  }
  if (check) return stale === 0 ? 0 : 1;
  console.log(`total: ${totalBefore} -> ${totalAfter} bytes`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('optimize-lottie.mjs')) {
  process.exitCode = main(process.argv.slice(2));
}
