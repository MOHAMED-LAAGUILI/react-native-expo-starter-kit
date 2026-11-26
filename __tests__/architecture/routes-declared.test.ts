/**
 * Expo Router SDK 58: Drawer and Tabs register ONLY the screens declared in
 * their layout. A route file with no matching `<Drawer.Screen>` /
 * `<Tabs.Screen>` silently becomes unreachable — no error, the link just goes
 * nowhere. These guards fail as soon as a route file and its layout drift.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

/** Route names Expo Router derives from the files in `dir`. */
function routeFiles(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  const names: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const hasLayout = fs.existsSync(path.join(abs, entry.name, '_layout.tsx'));
      if (entry.name.startsWith('(') || hasLayout) {
        names.push(entry.name); // group or nested navigator — one screen in this layout
      }
      else {
        // Plain folder without a layout: each file is its own screen, `<folder>/<file>`.
        for (const child of fs.readdirSync(path.join(abs, entry.name)).filter(f => f.endsWith('.tsx')))
          names.push(`${entry.name}/${child.replace(/\.tsx$/, '')}`);
      }
      continue;
    }
    if (!entry.name.endsWith('.tsx') || entry.name.startsWith('_') || entry.name.startsWith('+'))
      continue;
    names.push(entry.name.replace(/\.tsx$/, ''));
  }
  return names.sort();
}

describe('drawer routes (app/(app)/_layout.tsx)', () => {
  const layout = read('app/(app)/_layout.tsx');
  const block = layout.match(/const DRAWER_ROUTES = \[([\s\S]*?)\] as const/);

  it('declares a DRAWER_ROUTES list', () => {
    expect(block).not.toBeNull();
  });

  it('lists exactly the route files under app/(app)/', () => {
    const declared = [...(block?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]).sort();
    expect(declared).toEqual(routeFiles('app/(app)'));
  });
});

describe('tab routes (app/(app)/(tabs)/_layout.tsx)', () => {
  const layout = read('app/(app)/(tabs)/_layout.tsx');
  const navigation = read('src/config/navigation.ts');
  const tabNames = [...navigation.matchAll(/tab:\s*\{\s*name:\s*'([^']+)'/g)].map(m => m[1]);
  const hiddenScreens = [...layout.matchAll(/<Tabs\.Screen\s+name="([^"]+)"/g)].map(m => m[1]);

  it('declares every route file as a NAV_ITEMS tab or a hidden <Tabs.Screen>', () => {
    const declared = new Set([...tabNames, ...hiddenScreens]);
    const undeclared = routeFiles('app/(app)/(tabs)').filter(name => !declared.has(name));
    expect(undeclared).toEqual([]);
  });

  it('only declares tabs that have a route file', () => {
    const files = new Set(routeFiles('app/(app)/(tabs)'));
    expect([...tabNames, ...hiddenScreens].filter(name => !files.has(name))).toEqual([]);
  });

  // expo-router 58.0.3x maps `href: null` to `hidden`, which treats the screen
  // like a guarded one: navigating to it redirects to the first tab. The custom
  // tab bar already skips routes with no tab config, so declare them plainly.
  it('never hides a tab route with href: null (it would become unreachable)', () => {
    expect(layout).not.toMatch(/href:\s*null/);
  });
});
