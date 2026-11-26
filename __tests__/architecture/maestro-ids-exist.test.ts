/**
 * Every `id:` a Maestro flow taps or asserts must be a testID that exists in
 * the app. A renamed or deleted testID otherwise only surfaces as a slow E2E
 * timeout on CI ("element not found") instead of a fast unit-test failure.
 *
 * Android system ids (`com.android.…:id/…`) are skipped — they belong to the OS.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const MAESTRO_DIR = path.join(ROOT, '.maestro');

function walk(dir: string, match: RegExp, out: string[] = []): string[] {
  if (!fs.existsSync(dir))
    return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      walk(full, match, out);
    else if (match.test(entry.name))
      out.push(full);
  }
  return out;
}

const sourceText = ['app', 'src']
  .flatMap(dir => walk(path.join(ROOT, dir), /\.tsx?$/))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

/** testID literals in source: `testID="x"`, `testID={'x'}`, and both branches of a ternary. */
const knownIds = new Set(
  [...sourceText.matchAll(/testID=(?:\{[^}]*\}|"[^"]*"|'[^']*')/g)]
    .flatMap(m => [...m[0].matchAll(/['"]([\w-]+)['"]/g)].map(id => id[1])),
);

const flowIds = walk(MAESTRO_DIR, /\.ya?ml$/).flatMap((file) => {
  const yaml = fs.readFileSync(file, 'utf8');
  return [...yaml.matchAll(/^\s*-?\s*id:\s*["']?([^"'\n#]+?)["']?\s*$/gm)]
    .map(m => m[1].trim())
    .filter(id => !id.includes(':id/') && !id.startsWith('${'))
    .map(id => ({ id, file: path.relative(ROOT, file) }));
});

describe('maestro ids', () => {
  it('finds flows that reference ids', () => {
    expect(flowIds.length).toBeGreaterThan(0);
  });

  it('only references testIDs that exist in app/ or src/', () => {
    const missing = flowIds.filter(({ id }) => !id.split('|').some(alt => knownIds.has(alt)));
    expect(missing).toEqual([]);
  });
});
