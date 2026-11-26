#!/usr/bin/env node
/**
 * Unreferenced-module guard (ported from the clocknet repo).
 *
 * Builds the module graph by resolving every `@/`-aliased (→ src/) and
 * relative import, re-export, dynamic `import()`, `require()` and
 * `jest.mock()` specifier. `app/**` (the expo-router route tree) plus the
 * tool-loaded entry points below are the roots. It reports, everywhere outside
 * SKIP_DIRECTORIES:
 *
 *   1. modules reached by nothing at all — not app code, not tests;
 *   2. modules reached only by their own tests — green coverage on code no
 *      user can reach, which reads as proof a screen works when it does not.
 *
 * Exits non-zero when either list is non-empty after the allow-list below.
 * Run it with `pnpm run unreferenced` (add `--json` for machine output).
 * Complements knip (`pnpm run deps:unused`), which checks dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.json'];
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.expo',
  '.git',
  'android',
  'ios',
  'assets',
  'coverage',
  'dist',
  'docs',
  'docker',
  '.github',
  '.claude',
  '.agents',
]);

/**
 * Entry points outside `app/`. These are loaded by a tool (Expo config, Jest,
 * Metro) rather than imported by another module, so the graph would otherwise
 * report everything below them as unreachable.
 */
const EXTRA_ENTRY_POINTS = [
  'app.config.ts',
  'babel.config.js',
  'metro.config.js',
  'jest.config.js',
  'jest.setup.js',
  'jest.setup.ts',
  'index.js',
  'index.ts',
];

/**
 * Modules that are legitimately unreferenced by the graph, each with the
 * reason. Keep this list short and argued — an entry here is a claim that the
 * module is loaded by something the resolver cannot see, not permission to
 * leave dead code in the tree.
 *
 * @type {{ pattern: RegExp, reason: string }[]}
 */
const ALLOW_LIST = [
  {
    pattern: /^script\//,
    reason: 'Node tooling run by package scripts (`node script/…`) or imported by those scripts — see package.json.',
  },
  {
    pattern: /^\.maestro\/scripts\//,
    reason: 'Maestro `runScript` files, loaded by Maestro flows on the host — never imported by app code.',
  },
  {
    pattern: /^eslint\.config\.m?js$/,
    reason: 'Flat config loaded by ESLint itself (`pnpm run lint`).',
  },
  {
    pattern: /^src\/widgets\//,
    reason: 'Home-screen widget code is registered by the native widget config, not imported by the app.',
  },
]

function isCodeFile(file) {
  return /\.(tsx?|jsx?)$/.test(file) && !/\.d\.ts$/.test(file);
}

function isTestFile(relativePath) {
  return (
    /(^|\/)__tests__\//.test(relativePath) ||
    /(^|\/)__mocks__\//.test(relativePath) ||
    /\.(test|spec)\.[jt]sx?$/.test(relativePath)
  );
}

function toRelative(file) {
  return path.relative(PROJECT_ROOT, file).split(path.sep).join('/');
}

function walk(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      walk(full, found);
    } else if (entry.isFile()) {
      found.push(full);
    }
  }
  return found;
}

function resolveSpecifier(specifier, fromFile) {
  let base;
  if (specifier.startsWith('@/')) {
    base = path.join(PROJECT_ROOT, 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null; // bare package specifier — not ours
  }

  for (const extension of RESOLVE_EXTENSIONS) {
    const candidate = base + extension;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  if (fs.existsSync(base)) {
    const stat = fs.statSync(base);
    if (stat.isFile()) return base;
    if (stat.isDirectory()) {
      for (const extension of RESOLVE_EXTENSIONS) {
        const candidate = path.join(base, 'index' + extension);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return null;
}

const SPECIFIER_PATTERNS = [
  // import X from 'y' / import type { X } from 'y' / import { a, b } from 'y'
  /\bimport\s+[^'";]*?from\s*['"]([^'"]+)['"]/g,
  // import 'y' (side-effect)
  /\bimport\s*['"]([^'"]+)['"]/g,
  // export ... from 'y'
  /\bexport\s+[^'";]*?from\s*['"]([^'"]+)['"]/g,
  // await import('y') — lazy routes count as live importers
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // require('y')
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // jest.mock('y') / jest.requireActual('y')
  /\bjest\s*\.\s*(?:mock|unmock|doMock|requireActual|requireMock)\s*\(\s*['"]([^'"]+)['"]/g,
];

function dependenciesOf(file) {
  let source;
  try {
    source = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const resolved = new Set();
  for (const pattern of SPECIFIER_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const target = resolveSpecifier(match[1], file);
      if (target && isCodeFile(target)) resolved.add(target);
    }
  }
  return [...resolved];
}

function reachableFrom(entryPoints) {
  const seen = new Set();
  const stack = [...entryPoints];
  while (stack.length > 0) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const dependency of dependenciesOf(file)) {
      if (!seen.has(dependency)) stack.push(dependency);
    }
  }
  return seen;
}

function allowReason(relativePath) {
  const hit = ALLOW_LIST.find((entry) => entry.pattern.test(relativePath));
  return hit ? hit.reason : null;
}

function analyse() {
  const allFiles = walk(PROJECT_ROOT).filter(isCodeFile);

  const routeEntries = allFiles.filter((file) => toRelative(file).startsWith('app/'));
  const extraEntries = allFiles.filter((file) => EXTRA_ENTRY_POINTS.includes(toRelative(file)));
  const testEntries = allFiles.filter((file) => isTestFile(toRelative(file)));
  const liveEntries = [...routeEntries, ...extraEntries];

  const liveGraph = reachableFrom(liveEntries);
  const graphWithTests = reachableFrom([...liveEntries, ...testEntries]);

  const sourceModules = allFiles.filter((file) => {
    const relative = toRelative(file);
    // Every non-test module the walker found, not only src/.
    // app/** files are graph roots, so they are never reported.
    return !isTestFile(relative);
  });

  const unreferenced = [];
  const testOnly = [];
  const allowed = [];

  for (const file of sourceModules) {
    const relative = toRelative(file);
    const reason = allowReason(relative);
    if (!graphWithTests.has(file)) {
      if (reason) allowed.push({ file: relative, reason });
      else unreferenced.push(relative);
    } else if (!liveGraph.has(file)) {
      if (reason) allowed.push({ file: relative, reason });
      else testOnly.push(relative);
    }
  }

  unreferenced.sort();
  testOnly.sort();
  return { unreferenced, testOnly, allowed, scanned: sourceModules.length };
}

function main() {
  const asJson = process.argv.includes('--json');
  const result = analyse();

  if (asJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    console.log('===== MODULES REACHED BY NOTHING AT ALL =====');
    if (result.unreferenced.length === 0) console.log('  (none)');
    else result.unreferenced.forEach((file) => console.log('  ' + file));

    console.log('===== MODULES REACHED ONLY BY TESTS =====');
    if (result.testOnly.length === 0) console.log('  (none)');
    else result.testOnly.forEach((file) => console.log('  ' + file));

    console.log(
      '\nScanned ' +
        result.scanned +
        ' modules; ' +
        result.allowed.length +
        ' allow-listed.'
    );
  }

  const failures = result.unreferenced.length + result.testOnly.length;
  if (failures > 0) {
    // stderr, not stdout: in --json mode stdout must stay parseable, and the
    // Jest wrapper reads the findings back from it on a non-zero exit.
    console.error(
      '\n' +
        failures +
        ' unreferenced module(s). Route them, import them, delete them ' +
        '(with their tests), or add an argued entry to ALLOW_LIST in ' +
        'scripts/check-unreferenced-modules.js.'
    );
    process.exit(1);
  }
  if (!asJson) {
    console.log('\nNo unreferenced modules.');
  }
}

main();
