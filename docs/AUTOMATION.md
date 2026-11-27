# Automation

Every routine task has one command. Each runs the same way locally and in CI.

## Setup

| Command | What it does |
|---|---|
| `pnpm run setup` | First run: `install:safe` → `.env.*` files → `setup:check` |
| `pnpm run skills:add -- <owner/repo>` · `skills:find` · `skills:update` | Agent skills in `.claude/skills/` via the skills.sh CLI (committed, no lockfile) |
| `pnpm run setup:check` | Checks Node, pnpm, `node_modules`, `.env.*`, JDK 17, Android SDK / `adb` / CMake, Xcode / CocoaPods (macOS), git, Watchman, Maestro — each with a fix. `--android` / `--ios` / `--e2e` make that toolchain required (exit 1 if missing). |
| `pnpm run install:safe` | `pnpm install` behind the `guard` (refuses while Metro, Gradle or another pnpm holds `node_modules`) |
| `pnpm run env:create` | `.env.development|preview|production` from `.env.example` |

## Dependencies

| Command | What it does |
|---|---|
| `pnpm run deps:check` | One report: Expo SDK alignment · outdated packages (SDK-managed vs. free, majors flagged) · unused / unlisted deps (knip) · duplicate singletons (react, react-native, reanimated, …) · lighter alternatives. `--strict` exits 1 on misalignment, duplicates or unlisted imports. |
| `pnpm run deps:fix` | Align SDK-managed packages (`expo install --fix`) |
| `pnpm run deps:unused` | Raw knip: unused files and dependencies (config: `knip.json`; UI-kit exports are public API and ignored) |
| `pnpm run unreferenced` | Modules reached by nothing, or only by their own tests (`--json` for machine output) |
| `pnpm run upgrade:expo` | Scripted SDK upgrade — see below |

### `pnpm run upgrade:expo`

```bash
pnpm run upgrade:expo                 # latest SDK
pnpm run upgrade:expo -- --sdk 59     # a specific SDK
pnpm run upgrade:expo -- --dry-run    # print the plan only
```

1. **guard** — nothing may hold `node_modules`.
2. **bump** `expo` to the latest release of the target SDK.
3. **install** — on `EPERM` / `EBUSY` (Windows file locks) it deletes `node_modules` and installs fresh; fresh installs never rename over existing folders.
4. **align** — `expo install --fix`; if its own pnpm call hits a lock, it applies the version list Expo printed and reinstalls.
5. **companions** — `@types/react`, `@react-native/metro-config`, `@expo/config` (not managed by `expo install`).
6. **verify** — `type:check`, `test`, `expo-doctor`.

Then it prints what's left for a human: read the release notes, rebuild the dev client, bump `version`. Record the upgrade in [UPGRADING.md](UPGRADING.md).

## Quality

| Command | What it does |
|---|---|
| `pnpm run checks` | deps:fix → lint:fix → type:check → test → i18n:check → doctor (the pre-commit hook) |
| `pnpm test` · `test:coverage` · `test:discovery` | Jest — see [TESTING.md](TESTING.md) |
| `pnpm run i18n:check` | EN/FR key parity |
| `pnpm run e2e:metro` + `e2e:android` / `e2e:ios` | Maestro — see [.maestro/README.md](../.maestro/README.md) |

## Performance & size

| Command | What it does |
|---|---|
| `pnpm run perf:bundle` | Exports the production bundle and ranks what each package adds — see [PERFORMANCE.md](PERFORMANCE.md) |
| `pnpm run perf:budget` | Same, and exits 1 if the bundle is over `perf-budget.json` |
| `pnpm run images:optimize` · `images:check` | Lossless image optimization (verified pixel-identical) / CI gate |
| `pnpm run icons` · `icons:check` | Render the icon, adaptive icon, light/dark splash, favicon and notification icon from `assets/brand/icon.svg`; `--check` is also run by the `app-icons` Jest test |
| `pnpm run perf:device` | Cold-start time over adb (`cold-start --runs N`) or idle CPU/memory/FPS sampling (`sample`) — needs a connected device or emulator |
| `pnpm run lottie:optimize -- <files…>` | Lottie JSON: minify, round coordinates (timing keys untouched), drop hidden layers and unused assets, re-encode embedded PNGs only when pixel-identical; `--check` for CI |
| `pnpm run dev:atlas` | Expo Atlas — interactive module graph of the bundle |

## Docs & demo

| Command | What it does |
|---|---|
| `pnpm run docs:badges` | Regenerate the README badges from `package.json` (versions = installed packages; removed packages drop out) |
| `pnpm run docs:check` | Fail if the badges are stale (CI, `checks`) |
| `pnpm run demo:record` | Screen-record `.maestro/demo/tour.yaml` on the connected device → `docs/assets/demo.gif` + `demo.mp4`, and rewrite the README demo block. Needs Metro in E2E mode (`pnpm run e2e:metro`), Maestro and ffmpeg. `--platform ios` on macOS. |

## Builds & releases

| Command | What it does |
|---|---|
| `pnpm run build:local:android` · `build:local:install` | Release APK on your machine, no EAS — [LOCAL_BUILDS.md](LOCAL_BUILDS.md) |
| `pnpm run build:{dev,prev,prod}:{android,ios}` | EAS cloud builds |
| `pnpm run flow:build-{android,ios}:main` | EAS workflow builds from `main` |
| `pnpm run eas:update:prod` | OTA update to production |
| `pnpm run submit:{android,ios}` | Store submission |
| `pnpm run eas:update:prev` · `eas:update:prod` | OTA update (message = last commit) |
| `pnpm run docker:build` · `docker:emulator` · `docker:down` | APK built in Docker · containerised emulator — [DOCKER.md](DOCKER.md) |
| `pnpm run release` · `release:dry` | release-it: checks → bump → badges → commit → tag → push → GitHub release |

## Scheduled (GitHub Actions)

| Workflow | When | What |
|---|---|---|
| `ci.yml` | every PR + push to `main` | lint, types, tests, discovery, i18n, images, README badges, gitleaks, Maestro syntax |
| `e2e.yml` | push to `main` + manual | Maestro on an Android emulator |
| `maintenance.yml` | Mondays 06:00 UTC + manual | `deps:check --strict` and `perf:bundle --budget` into the job summary; bundle report artifact |
| `release.yml` | every push to `main` + manual | Infers patch/minor/major from commits, bumps the version, writes CHANGELOG.md, updates badges, tags, pushes and publishes the GitHub release (skips its own release commits and docs/chore-only pushes) |
| `react-doctor.yml` | PR + push to `main` | React Doctor review |
| Dependabot | monthly | GitHub Actions versions only — npm packages move with `upgrade:expo` so the SDK stays aligned |
