/**
 * Guards metro.config.js. A blockList regex that silently matches nothing is
 * the classic failure: Metro then crawls android/ (often >1 GB of Gradle
 * output) and on Windows runs out of file watchers. Assert the real exported
 * config against real paths, with both separators.
 *
 * The config is loaded in a child Node process: `uniwind/metro` installs Node
 * module hooks, which Jest's sandboxed module loader refuses to run.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

const probe = spawnSync(
  process.execPath,
  [
    '-e',
    `const c = require('./metro.config.js');
     const list = [].concat(c.resolver.blockList);
     process.stdout.write(JSON.stringify({ sources: list.map(r => r.source), flags: list.map(r => r.flags), useWatchman: c.resolver.useWatchman }));`,
  ],
  { cwd: ROOT, encoding: 'utf8', env: { ...process.env, EXPO_USE_WATCHMAN: '0' } },
);

type Probe = { sources: string[], flags: string[], useWatchman: unknown };
const loaded: Probe | null = probe.status === 0 ? JSON.parse(probe.stdout.slice(probe.stdout.indexOf('{'))) : null;
const patterns = loaded ? loaded.sources.map((source, i) => new RegExp(source, loaded.flags[i])) : [];

const isBlocked = (file: string) => patterns.some(pattern => pattern.test(file));
const native = (...segments: string[]) => path.join(ROOT, ...segments);
const posix = (...segments: string[]) => native(...segments).replace(/\\/g, '/');

describe('metro.config.js', () => {
  it('loads', () => {
    expect(probe.stderr).not.toMatch(/Error/);
    expect(loaded).not.toBeNull();
  });

  it.each(['android', 'ios', 'dist', 'build', 'coverage', '.git'])('blocks %s/ with either path separator', (dir) => {
    expect(isBlocked(native(dir, 'app', 'build.gradle'))).toBe(true);
    expect(isBlocked(posix(dir, 'app', 'build.gradle'))).toBe(true);
  });

  it.each([
    [['src', 'components', 'ui', 'button.tsx']],
    [['app', '_layout.tsx']],
    [['assets', 'images', 'logo.png']],
    [['src', 'style', 'global.css']],
    [['node_modules', 'expo-router', 'build', 'index.js']],
  ])('does not block %j', (segments) => {
    expect(isBlocked(native(...segments))).toBe(false);
  });

  it('does not block similarly named source folders', () => {
    expect(isBlocked(native('src', 'android', 'widget.ts'))).toBe(false);
    expect(isBlocked(native('buildings.ts'))).toBe(false);
  });

  it('honours EXPO_USE_WATCHMAN=0', () => {
    expect(loaded?.useWatchman).toBe(false);
  });
});
