/**
 * Every icon the app config points at exists, has the right size and
 * transparency, and still matches assets/brand/icon.svg — so a deleted,
 * truncated or hand-edited PNG fails the test run. Regenerate with
 * `pnpm run icons`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ICON_SOURCE, ICON_VARIANTS } from '../../script/lib/icon-variants';

const ROOT = path.resolve(__dirname, '../..');

describe('app icons', () => {
  it('has the vector source', () => {
    expect(fs.existsSync(path.join(ROOT, ICON_SOURCE))).toBe(true);
  });

  it.each(ICON_VARIANTS.map(v => [v.file, v] as const))('%s has the right size and transparency', async (_file, variant) => {
    const file = path.join(ROOT, variant.file);
    expect(fs.existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([variant.size, variant.size]);
    const { isOpaque } = await sharp(file).stats();
    expect(isOpaque).toBe(Boolean(variant.opaque));
  });

  it('every icon path in app.config.ts is a generated file', () => {
    const config = fs.readFileSync(path.join(ROOT, 'app.config.ts'), 'utf8');
    const generated = new Set(ICON_VARIANTS.map(v => `./${v.file}`));
    const referenced = [...config.matchAll(/(?:icon|image|foregroundImage|favicon): '(\.\/assets\/images\/[^']+\.png)'/g)].map(m => m[1]);
    expect(referenced.length).toBeGreaterThan(0);
    expect(referenced.filter(p => !generated.has(p))).toEqual([]);
  });

  it('the committed PNGs match a fresh render of the source', () => {
    const result = spawnSync(
      process.execPath,
      ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'script/render-icons.ts', '--check'],
      { cwd: ROOT, encoding: 'utf8' },
    );
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  }, 60_000);
});
