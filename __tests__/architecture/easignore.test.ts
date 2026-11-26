/**
 * When `.easignore` exists, EAS CLI uses it INSTEAD of every `.gitignore`
 * (https://docs.expo.dev/build-reference/project-upload/). A pattern added to
 * `.gitignore` but not here would start uploading to EAS — local env files,
 * signing keys, build output. Keep the two in sync verbatim.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

function patterns(file: string): string[] {
  return fs.readFileSync(path.join(ROOT, file), 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'));
}

describe('.easignore', () => {
  const easignore = new Set(patterns('.easignore'));

  it('repeats every .gitignore pattern', () => {
    const missing = patterns('.gitignore').filter(pattern => !easignore.has(pattern));
    expect(missing).toEqual([]);
  });

  it('keeps the files the build itself needs', () => {
    // `pnpm:devPreinstall` runs this on the EAS builder during `pnpm install`.
    expect(easignore.has('!/script/guard-node-modules.ts')).toBe(true);
    for (const needed of ['app/', '/app', 'src/', '/src', 'assets/', '/assets', 'package.json', 'pnpm-lock.yaml', 'eas.json', 'app.config.ts'])
      expect(easignore.has(needed)).toBe(false);
  });

  it('never uploads local env files or signing material', () => {
    for (const secret of ['.env.*', '*.jks', '*.p12', '*.p8', '*.key', '*.mobileprovision'])
      expect(easignore.has(secret)).toBe(true);
  });
});
