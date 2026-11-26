# Testing

Three layers, each with one tool and one job. Every layer runs locally with the same command CI uses.

| Layer | Tool | Lives in | Run | In CI |
|---|---|---|---|---|
| Unit / logic | Jest 30 (`node` project) | `__tests__/**/*.test.ts` | `pnpm test --selectProjects node` | every PR (`ci.yml`) |
| Component / hook | Jest + React Native Testing Library 14 (`rn` project, `jest-expo/ios`) | `__tests__/**/*.test.tsx` | `pnpm test --selectProjects rn` | every PR |
| Architecture guards | Jest (`node` project) — source scans | `__tests__/architecture/` | `pnpm test` | every PR |
| End-to-end | Maestro 2.10 | `.maestro/` | `pnpm run e2e:android` | push to `main` + manual (`e2e.yml`) |
| Static | `tsc` strict (app, `script/`, `__tests__/`) + ESLint | — | `pnpm run type:check` · `pnpm run lint:fix` | every PR |

`pnpm run checks` runs deps → lint → types → tests → locale parity → doctor, and is what the pre-commit hook runs.

## Jest

### Two projects, split by extension

`jest.config.js` defines two projects so pure logic never pays the React Native start-up cost:

- **`node`** — `*.test.ts`. Plain Node + `babel-jest`. Use it for utils, Zod schemas, config and the architecture guards. Importing `react-native` here fails loudly, which is the point: it keeps logic tests fast and honest.
- **`rn`** — `*.test.tsx`. `jest-expo/ios` preset with RNTL. Use it for components, hooks and anything that imports `react-native` or an Expo module.

> The extension picks the project. A `.tsx` file is an `rn` test even if it has no JSX.

Never pass a bare `--testMatch` on the CLI — it replaces both projects' globs at once. Narrow with `--selectProjects node|rn` and a path instead: `pnpm test --selectProjects rn __tests__/components`.

`pnpm run test:discovery` fails when a file under `__tests__/` isn't matched by any project (a wrong `testMatch` makes Jest run fewer tests and still report green).

Tests are type-checked by their own project, `__tests__/tsconfig.json` (Jest + Node types), as the third pass of `pnpm run type:check`.

### Setup files (`__tests__/setup/`)

| File | Project | Why |
|---|---|---|
| `no-real-network.js` | both | `fetch` rejects, and any attempt fails the test that made it. Mock the API layer instead. |
| `rn-mocks.js` | rn | In-memory `expo-secure-store` and `expo-file-system`; `uniwind` theme hook. |
| `resolve-expo-lazy-globals.js` | rn | Touches SDK 58's lazy web globals before teardown ("import after the environment has been torn down"). |
| `i18n.js` | rn | Real English resources, so assertions match what users see. |

Reanimated 4 / Worklets need **no mock**: the `rn` project uses `react-native-reanimated/jest/resolver`, which loads their JS implementations. `lucide-react-native` is mapped to its CommonJS entry (its default export is an `.mjs` build Jest won't transform).

### Writing tests

- RNTL 14's `render`, `renderHook` and `fireEvent` are **async** — always `await` them.
- Query by role, text or `testID`, in that order of preference. `testID`s are kebab-case `<screen>-<element>` (`login-email`, `home-screen`) and double as Maestro selectors.
- Storage is the in-memory keychain from `rn-mocks.js`; reach it with `require('expo-secure-store').__store`. Modules that cache (like `@/storage`) need `jest.isolateModules` for a fresh copy per test.
- Fake timers: `jest.useFakeTimers()` + `await act(async () => jest.advanceTimersByTime(ms))`.

### Architecture guards

Source-scanning tests in `__tests__/architecture/` turn "remember to…" rules into failures:

| Guard | Fails when |
|---|---|
| `routes-declared` | a route file under `app/(app)/` isn't in `DRAWER_ROUTES`, or a `(tabs)/` route is neither a `NAV_ITEMS` tab nor a hidden `<Tabs.Screen>` (SDK 58 makes undeclared routes unreachable) |
| `no-removed-rn-apis` | code uses an API RN 0.88 removed (`InteractionManager`, `react-native/Libraries/*`, `Touchable`, `freezeOnBlur`, `initialRouteName`, …) |
| `maestro-ids-exist` | a Maestro flow references a `testID` that no component renders |
| `metro-config` | Metro's `blockList` stops matching `android/`, `ios/`, … (with either path separator) |
| `locale-parity` | `fr` is missing a key `en` has (same as `pnpm run i18n:check`) |

## Maestro (E2E)

See [`.maestro/README.md`](../.maestro/README.md) for running flows locally, conventions and the CI setup.

## Coverage

`pnpm run test:coverage` writes `coverage/` (uploaded as a CI artifact). There is no threshold yet — add `coverageThreshold` to `jest.config.js` once the suite covers the parts you care about.
