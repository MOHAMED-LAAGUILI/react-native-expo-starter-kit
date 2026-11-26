/**
 * React Native 0.88 (Expo SDK 58) removed or type-banned these APIs. They
 * fail at runtime or at type-check, often only on one platform — so the scan
 * runs over source text and catches them before a device does.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIRS = ['app', 'src'];

const BANNED: Array<{ pattern: RegExp, reason: string }> = [
  { pattern: /\bInteractionManager\b/, reason: 'removed in RN 0.88 — use requestIdleCallback' },
  { pattern: /from ['"]react-native\/Libraries\//, reason: 'deep imports are type errors in RN 0.88 — import from "react-native"' },
  { pattern: /\bimport\s*\{[^}]*\bTouchable\b[^}]*\}\s*from ['"]react-native['"]/, reason: '`Touchable` root export removed — use Pressable' },
  { pattern: /\bImageBackground\b/, reason: 'deprecated in RN 0.88 — View + absolutely positioned Image' },
  { pattern: /\bfreezeOnBlur\s*:/, reason: 'no-op since Expo Router SDK 58, and freezing breaks Uniwind theme updates' },
  { pattern: /\binitialRouteName\b/, reason: 'removed from Expo Router layouts — use `unstable_settings = { anchor }`' },
];

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      sourceFiles(full, out);
    else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
      out.push(full);
  }
  return out;
}

/** Strip comments so documentation that *mentions* an API doesn't trip the guard. */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('no APIs removed in React Native 0.88 / Expo SDK 58', () => {
  const files = SOURCE_DIRS.flatMap(dir => sourceFiles(path.join(ROOT, dir)));

  it('scans the app sources', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(BANNED.map(b => [b.pattern.source, b]))('%s', (_label, { pattern, reason }) => {
    const offenders = files
      .filter(file => pattern.test(stripComments(fs.readFileSync(file, 'utf8'))))
      .map(file => path.relative(ROOT, file));
    expect({ reason, offenders }).toEqual({ reason, offenders: [] });
  });
});
