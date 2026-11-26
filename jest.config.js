/**
 * Two Jest projects, split by file extension:
 *
 *   node  `__tests__/**\/*.test.ts`   pure logic, config, source-scanning
 *                                    "architecture" guards. Plain Node, no RN
 *                                    runtime — fast, and fails loudly if a
 *                                    test accidentally pulls in react-native.
 *   rn    `__tests__/**\/*.test.tsx`  components and hooks, rendered with
 *                                    @testing-library/react-native on the
 *                                    jest-expo iOS preset.
 *
 * Run one project with `pnpm test --selectProjects node` (or `rn`). Never pass
 * a bare `--testMatch` on the CLI: it replaces both projects' globs at once.
 * `pnpm run test:discovery` fails if a file under __tests__/ is not matched.
 */
const path = require('node:path');

const rnPreset = require('jest-expo/ios/jest-preset');

// testMatch globs are built from absolute forward-slash paths: `<rootDir>` is
// substituted unescaped, and on Windows its backslashes turn into regex escapes
// that match nothing — Jest then reports 0 tests and exits green.
const testsDir = `${__dirname.replace(/\\/g, '/')}/__tests__`;

// ESM-only / untranspiled packages that must go through Babel. jest-expo's
// first pattern is a negative lookahead of package names; prepend ours.
const EXTRA_TRANSFORM = [
  'uniwind',
  '@rn-primitives',
  'lucide-react-native',
  'number-flow-react-native',
  'react-native-toast-message-ts',
  'morphicons',
  '@gorhom',
  'gifted-charts-core',
];
const transformIgnorePatterns = rnPreset.transformIgnorePatterns.map((pattern, index) => {
  if (index !== 0)
    return pattern;
  if (!pattern.includes('(?!('))
    throw new Error(`jest-expo transformIgnorePatterns[0] changed shape, update jest.config.js: ${pattern}`);
  return pattern.replace('(?!(', `(?!(${EXTRA_TRANSFORM.join('|')}|`);
});

const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@assets/(.*)$': '<rootDir>/assets/$1',
};

/** @type {import('jest').Config} */
module.exports = {
  // jest-expo's cold start alone can exceed the 5 s default on CI runners.
  testTimeout: 30_000,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/widgets/**',
    '!src/i18n/locales/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [`${testsDir}/**/*.test.ts`],
      transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
      moduleNameMapper,
      setupFilesAfterEnv: [path.join(__dirname, '__tests__/setup/no-real-network.js')],
    },
    {
      displayName: 'rn',
      preset: 'jest-expo/ios',
      testMatch: [`${testsDir}/**/*.test.tsx`],
      // Reanimated 4 + Worklets: resolve their JS (non-`.native`) implementations,
      // which run without the native Worklets runtime.
      resolver: 'react-native-reanimated/jest/resolver',
      transformIgnorePatterns,
      moduleNameMapper: {
        ...rnPreset.moduleNameMapper,
        ...moduleNameMapper,
        // Its `exports` resolve to an `.mjs` ESM build Jest won't transform; use the CJS entry.
        '^lucide-react-native$': require.resolve('lucide-react-native').replace(/\\/g, '/'),
      },
      setupFiles: [
        ...(rnPreset.setupFiles ?? []),
        'react-native-gesture-handler/jestSetup',
        path.join(__dirname, '__tests__/setup/rn-mocks.js'),
      ],
      setupFilesAfterEnv: [
        ...(rnPreset.setupFilesAfterEnv ?? []),
        path.join(__dirname, '__tests__/setup/resolve-expo-lazy-globals.js'),
        path.join(__dirname, '__tests__/setup/no-real-network.js'),
        path.join(__dirname, '__tests__/setup/i18n.js'),
      ],
    },
  ],
};
