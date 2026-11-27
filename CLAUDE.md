# CLAUDE.md — AI entry point

Claude Code loads this file at the start of every session. It is the **map**: what this repo is, the rules that apply to every change, how to verify work, and which document to open for what. It is the **single source of truth** for every agent — the full project conventions follow the entry sections below. `AGENTS.md` only points here (Cursor, Codex and other agents read it and follow the pointer).

## What this is

A production-ready **Expo SDK 58** starter (React Native 0.88, React 19.3, TypeScript 6 strict, pnpm 10) — Expo Router (Drawer + Tabs), Tailwind v4 via Uniwind, Zustand + TanStack Query, i18n (EN/FR), `expo-secure-store` persistence, Jest + Maestro tests. It runs in a **dev build**, not Expo Go.

## Rules for every change

1. **Docs first for libraries.** Before using or answering about any library/SDK API, look it up with Context7 (`npx ctx7@latest library …` → `docs …`) — see § Context7 below. Don't trust memory for Expo/RN APIs; SDK 58 changed many.
2. **Follow the conventions below.** Imports, naming, state, UI, i18n, cross-platform rules. When a rule and the code disagree, ask — don't silently pick one.
3. **Every user-facing string goes through `t()`**, with keys added to both `src/i18n/locales/en` and `fr` (`pnpm run i18n:check`).
4. **New route file → declare it.** SDK 58 Drawer/Tabs only register declared screens: add it to `DRAWER_ROUTES` (`app/(app)/_layout.tsx`) or as a `<Tabs.Screen>` — the `routes-declared` test fails otherwise.
5. **Tests ride with the code.** New logic → a `node` test (`*.test.ts`); new component/hook → an `rn` test (`*.test.tsx`); new screen a user walks through → a Maestro flow + `testID`s. See [docs/TESTING.md](docs/TESTING.md).
6. **Docs ride with the code.** Update `CLAUDE.md` / `DESIGN.md` / `README.md` / `docs/` in the same change (§ Documentation Sync).
7. **Native change → version bump.** Adding/removing/upgrading a package with native code, or changing native config in `app.config.ts`, must bump `version` in `package.json` (`runtimeVersion` uses the `appVersion` policy) and needs a new dev build. JS-only changes must not bump it.
8. **No secrets in code** — `EXPO_PUBLIC_*` ships to every device. Tokens live in `src/storage` (SecureStore). See [docs/SECRETS.md](docs/SECRETS.md).
9. **Never touch `node_modules` while it's in use** (Windows locks files): use `pnpm run install:safe`. Never edit `android/`/`ios/` (CNG — use config plugins).
10. **Stop and ask** when a request is ambiguous or would widen permissions, change public behaviour, or delete data.

## Definition of done

- [ ] `pnpm run lint:fix` — 0 errors
- [ ] `pnpm run type:check` — app, `script/` and `__tests__/` all clean
- [ ] `pnpm test` — green; new behaviour has a test
- [ ] `pnpm run i18n:check` — EN/FR in parity
- [ ] Docs updated in the same change
- [ ] Native change? version bumped, dev build rebuilt
- [ ] Touched a screen? checked on Android **and** iOS (or web if it ships there), light and dark

`pnpm run checks` runs all of it (it is also the pre-commit hook). Commit messages: `type(scope?): description` — `feat`, `fix`, `update`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `improve`.

## Commands you'll use most

| Task | Command |
|---|---|
| Dev server (fresh cache) | `pnpm dev` · `pnpm run android:dev` · `pnpm run ios:dev` |
| Install / repair deps | `pnpm run install:safe` · `pnpm run deps:fix` |
| All checks | `pnpm run checks` |
| Unit + component tests | `pnpm test` · `pnpm test --selectProjects node` / `rn` · `pnpm run test:coverage` |
| E2E (Maestro) | `pnpm run e2e:metro` then `pnpm run e2e:android` / `e2e:ios` |
| Local preview APK (no EAS) | `pnpm run build:local:android` · `pnpm run build:local:install` |
| Optimize images | `pnpm run images:optimize` · `pnpm run images:check` |
| Regenerate app icons | edit `assets/brand/icon.svg` → `pnpm run icons` → `pnpm run images:optimize` |
| Launch time on a device | `pnpm run perf:device` |
| Locale parity | `pnpm run i18n:check` |
| Is this machine ready? | `pnpm run setup:check` |
| Dependency health / alternatives | `pnpm run deps:check` |
| Upgrade the Expo SDK | `pnpm run upgrade:expo` |
| What makes the bundle heavy? | `pnpm run perf:bundle` |

The full command table is in § Commands below.

## SDK 58 gotchas (learned the hard way)

- `InteractionManager` is gone — use `requestIdleCallback` (see `useChartReady`). `TextInput`/`View` refs are `TextInputInstance`/`ViewInstance`.
- Gesture Handler 3: the legacy `Gesture.Pan()` builder's type is `LegacyPanGesture`.
- `npx expo …` may resolve the CLI from the wrong folder on newer npm — use `pnpm exec expo …` or `node node_modules/expo/bin/cli …`.
- The dev-server scripts (`dev`, `android`, `ios`, `web`, `e2e:metro`, `dev:atlas`) set `EXPO_NO_DEPENDENCY_VALIDATION=1`: `expo start`'s "update available" banner ignores pnpm's 7-day `minimumReleaseAge`, so it nagged about versions that cannot be installed yet. Version drift is still caught by `pnpm run deps:check` (also weekly in CI) and `pnpm run deps:fix`, which waits for the release-age window.
- `.easignore` **replaces** `.gitignore` for EAS uploads — keep every `.gitignore` pattern in it too.
- Upgrading: [docs/UPGRADING.md](docs/UPGRADING.md).
- Tree shaking (`EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1` + `EXPO_UNSTABLE_TREE_SHAKING=1`) is on for the `preview` profile only — it cuts the Android bundle ~29%; QA a preview build before adding it to `production`.
- iOS permission prompts live in `app.config.ts` (`IOS_PURPOSE_STRINGS`, EN + FR) — never in plugin options, which override them with generic text. Add a privacy-manifest reason when a new dependency uses a required-reason API.

## When to read what

| Working on… | Read |
|---|---|
| Any code change | the project conventions below |
| UI components, tokens, motion, charts | [`DESIGN.md`](DESIGN.md) |
| Tests (Jest, RNTL, architecture guards) | [`docs/TESTING.md`](docs/TESTING.md) |
| E2E flows | [`.maestro/README.md`](.maestro/README.md) |
| Local release builds | [`docs/LOCAL_BUILDS.md`](docs/LOCAL_BUILDS.md) |
| Expo SDK upgrades | [`docs/UPGRADING.md`](docs/UPGRADING.md) |
| Secrets, env vars, storage | [`docs/SECRETS.md`](docs/SECRETS.md) |
| Pre-release device sweep | [`docs/MOBILE_QA_CHECKLIST.md`](docs/MOBILE_QA_CHECKLIST.md) |
| Every automation command + scheduled workflow | [`docs/AUTOMATION.md`](docs/AUTOMATION.md) |
| Docker build + containerised emulator | [`docs/DOCKER.md`](docs/DOCKER.md) |
| Bundle weight, heavy deps and their alternatives | [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) |
| Setup, scripts, project overview | [`README.md`](README.md) |
| Contributing / commits | [`CONTRIBUTING.md`](CONTRIBUTING.md) |

Project slash commands (`.claude/commands/`): `/checks`, `/docs-sync`, `/i18n-check`, `/new-component`, `/new-screen`, `/setup`, `/ship`. The `rn-reviewer` agent (`.claude/agents/`) reviews changes against these conventions.

---

# Project conventions

## Context7 — Always Use On Every Request

**This project uses Context7 (`npx ctx7@latest`) for all library/framework/SDK/API/CLI documentation.**

- Before answering ANY question about a library, framework, SDK, API, CLI tool, or cloud service, ALWAYS run `npx ctx7@latest library "<name>" "<question>"` first.
- Pick the best match by description, code snippet count, and source reputation.
- Then run `npx ctx7@latest docs <libraryId> "<question>"` to get current documentation.
- This includes: React, React Native, Expo, Tailwind, Zustand, TanStack, i18next, Axios, Reanimated, Gesture Handler, Bottom Sheet, Primitives, and any other dependency.
- Do NOT rely on training data for library-specific syntax, API changes, version migrations, or configuration.
- If a command fails with a quota error, inform the user and suggest `npx ctx7@latest login`.

## Project Overview
Production-ready Expo + React Native starter with file-based routing, Tailwind v4 (Uniwind), Zustand, TanStack Query, i18n, auth, Drawer + Tabs navigation, and @gorhom/bottom-sheet.

## Commands

| Script                                   | Purpose 
|------------------------------------------|--------------------------------------------
| `pnpm run setup`                          | Bootstrap: `install:safe` + `env:create` + `setup:check`
| `pnpm run install:safe`                   | `pnpm install` behind the `guard` check — use this instead of a bare `pnpm install`
| `pnpm run guard`                          | Check nothing is using `node_modules` (pnpm, Metro, Gradle) and clear idle locks
| `pnpm run env:create`                     | Create missing `.env.{development,preview,production}` from `.env.example`
| `pnpm run env:check`                      | Preview the env file creation without writing (dry run)
| `pnpm run skills` / `skills:find` / `skills:add` / `skills:update` / `skills:init` | Manage agent skills in `.claude/skills/` with the skills.sh CLI (§ Skills)
| `pnpm dev`                                | Start Expo dev server (fresh cache)
| `pnpm run ios`                            | Dev server targeting iOS
| `pnpm run android`                        | Dev server targeting Android
| `pnpm run web`                            | Dev server targeting Web
| `pnpm run clean:app`                      | Clean pnpm cache, node_modules, native builds, and lockfile
| `pnpm run ios:pods`                       | Install CocoaPods for iOS (macOS)
| `pnpm run deps:fix`                       | Fix dependency versions via Expo (runs `guard` first)
| `pnpm run lint`                           | ESLint, check only (CI, release-it)
| `pnpm run lint:fix`                       | Run ESLint with auto-fix on all source files
| `pnpm run test:node` / `test:rn`          | One Jest project only
| `pnpm run docs:badges` / `docs:check`     | Regenerate README badges from package.json / fail if stale
| `pnpm run demo:record`                    | Record the app tour (Maestro + screen recording) → docs/assets/demo.gif + README
| `pnpm run docker:build` / `docker:emulator` / `docker:down` | Build the APK in Docker / run it in a containerised emulator (docs/DOCKER.md)
| `pnpm run release` / `release:dry`        | release-it: checks → bump → badges → commit → tag → push → GitHub release
| `pnpm run type:check`                     | Type-check the app, `script/` (Node types) and `__tests__/` (Jest types) — three tsc passes
| `pnpm test`                               | Jest — both projects (`node` for `*.test.ts`, `rn` for `*.test.tsx`)
| `pnpm run test:watch`                     | Jest in watch mode
| `pnpm run test:coverage`                  | Jest with coverage → `coverage/`
| `pnpm run test:discovery`                 | Fail if a file under `__tests__/` is not matched by any Jest project
| `pnpm run i18n:check`                     | Fail if a locale is missing (or has extra) keys vs. English, or a key's `{{placeholders}}` / `$t()` differ
| `pnpm run images:optimize`                | Lossless-optimize `assets/` images in place (`--lossy`, `--max-size`, `--dry-run`)
| `pnpm run images:check`                   | Fail if any image could still shrink (CI gate)
| `pnpm run e2e:metro`                      | Metro for Maestro (`CI=1 EXPO_NO_METRO_LAZY=1 expo start --dev-client`)
| `pnpm run e2e:android` / `e2e:ios`        | Run the Maestro suite in `.maestro/`
| `pnpm run setup:check`                    | Check this machine: Node, pnpm, node_modules, .env, JDK/Android SDK/adb, Xcode, Watchman, Maestro — with fixes (`--android`/`--ios`/`--e2e` = required)
| `pnpm run deps:check`                     | Dependency report: SDK alignment · outdated · unused/unlisted (knip) · duplicate singletons · alternatives (`--strict` for CI)
| `pnpm run deps:unused`                    | Raw knip: unused files/deps (config `knip.json`)
| `pnpm run unreferenced`                   | Fail on modules nothing imports, or only their own tests import (`script/check-unreferenced-modules.js`)
| `pnpm run lottie:optimize -- <files…>`    | Shrink Lottie JSON without changing what it draws (`--check`, `--dry-run`, `--precision=N`)
| `pnpm run upgrade:expo`                   | Scripted Expo SDK upgrade: guard → bump → install (EPERM fallback) → align → companions → verify (`--sdk N`, `--dry-run`)
| `pnpm run perf:bundle`                    | Production bundle size + what each package adds (`--platform ios`, `--top N`, `--update-budget`)
| `pnpm run perf:budget`                    | Fail if the bundle is over `perf-budget.json`
| `pnpm run perf:device`                    | Over adb: cold-start time (`cold-start --runs N`, default) or idle CPU/memory/FPS sampling (`sample -m 20 -i 60`) — docs/PERFORMANCE.md
| `pnpm run icons` / `icons:check`          | Render every app icon + splash PNG from `assets/brand/icon.svg` / fail if a committed PNG differs (`--list` shows what uses each)
| `pnpm run doctor`                         | Run Expo doctor diagnostics & React Doctor
| `pnpm run checks`                         | Run all checks (deps:fix → lint:fix → type:check → test → i18n:check → doctor)
| `pnpm run expo:config`                    | Print public Expo config
| `pnpm run build:local:android`            | Build a release APK locally — no EAS (`--profile`, `--emulator`, `--install`, `--arch`, `--clean`) → `dist/`
| `pnpm run build:local:install`            | Same, then `adb install -r` on the connected device
| `pnpm run prebuild`                       | Prebuild native project (all platforms)
| `pnpm run prebuild:dev`                   | Prebuild native project (development env)
| `pnpm run prebuild:prev`                  | Prebuild native project (preview env)
| `pnpm run prebuild:prod`                  | Prebuild native project (production env)
| `pnpm run android:dev`                    | Android dev server (development env)
| `pnpm run ios:dev`                        | iOS dev server (development env)
| `pnpm run android:prev`                   | Android dev server (preview env)
| `pnpm run ios:prev`                       | iOS dev server (preview env)
| `pnpm run android:prod`                   | Android dev server (production env)
| `pnpm run ios:prod`                       | iOS dev server (production env)
| `pnpm run eas:in`                         | EAS login
| `pnpm run eas:out`                        | EAS logout
| `pnpm run eas:id`                         | EAS reveal connected account
| `pnpm run build:dev:ios`                  | Build development iOS (EAS)
| `pnpm run build:dev:android`              | Build development Android (EAS)
| `pnpm run build:prev:ios`                 | Build preview iOS (EAS)
| `pnpm run build:prev:android`             | Build preview Android (EAS)
| `pnpm run build:prod:ios`                 | Build production iOS (EAS)
| `pnpm run build:prod:android`             | Build production Android (EAS)
| `pnpm run flow:build-ios:main`            | Trigger EAS workflow to build iOS from github branch named main
| `pnpm run flow:build-android:main`        | Trigger EAS workflow to build Android from github branch named main
| `pnpm run submit:android`                 | Submit Android build to Play Store
| `pnpm run submit:ios`                     | Submit iOS build to App Store
| `pnpm run eas:update:config`              | Configure EAS Update for the project
| `pnpm run eas:update:prev`                | Push OTA update to the preview channel (message = last commit)
| `pnpm run eas:update:prod`                | Push OTA update to the production channel (message = last commit)
| `pnpm run export:web`                     | Export web build locally static files
| `pnpm run deploy:web`                     | Deploy web build to production

### Skills (`.claude/skills/`)

Agent skills are committed in `.claude/skills/` — every clone gets them, no install step. Add, find and update them with the [skills.sh](https://skills.sh) CLI:

| Command | What it does |
|---|---|
| `pnpm run skills` | List the skills installed in this project |
| `pnpm run skills:find -- <query>` | Search skills.sh |
| `pnpm run skills:add -- <owner/repo>` | Add a skill from GitHub or skills.sh into `.claude/skills/` (copied, so it can be committed) — `-- <owner/repo> --skill <name>` for one skill, `--list` to preview |
| `pnpm run skills:update` | Update the project's skills to their latest versions |
| `pnpm run skills:init -- <name>` | Scaffold a new skill (`<name>/SKILL.md`) |

- Commit the files under `.claude/skills/` after adding or updating — they are reviewed like code.
- No lockfile: `skills-lock.json` is git-ignored; the committed files are the source of truth.
- **Installed now** (top skills.sh results): `find-skills` (vercel-labs/skills; load it first to discover any other skill), `agent-browser` (vercel-labs/agent-browser), `design-mobile-apps` (designed-by-ai/skills), `grill-with-docs` + the `grilling` and `domain-modeling` skills it calls (mattpocock/skills), `frontend-design` (anthropics/skills), and from expo/skills: `expo-overview`, `expo-dev-client`, `expo-upgrade`, `expo-native-ui`, `expo-router`, `expo-data-fetching`, `expo-animation`, `expo-project-structure`, `eas-workflows`, `eas-app-stores`, `eas-update`.
- **Gotcha:** with `--yes`, the skills CLI ignores `--skill` for repos that hold many skills and copies all of them. After adding from such a repo, delete the folders you don't want before committing.
- Recommended sources for this stack (what the kit used to pin):

| Repository | Skills |
|---|---|
| `expo/skills` | building-native-ui, expo-api-routes, expo-cicd-workflows, expo-deployment, expo-dev-client, expo-tailwind-setup, native-data-fetching, upgrading-expo, use-dom |
| `emilkowalski/skills` | animate, animate-expo, animation-vocabulary, apple-design, ask-sonner, find-animation-opportunities, improve-animations, prototype, review-animations |
| `vercel-labs/agent-skills` | composition-patterns, react-best-practices |
| `anthropics/skills` | frontend-design |
| `addyosmani/web-quality-skills` | accessibility |
| `sleekdotdesign/agent-skills` | design-mobile-apps |
| `shadcn/ui` | shadcn |
| `giuseppe-trisciuoglio/developer-kit` | tailwind-css-patterns |
| `secondsky/claude-skills` | tailwind-v4-shadcn |
| `wshobson/agents` | typescript-advanced-types |
| `pproenca/dot-skills` | zod |

- Node tooling in `script/` is TypeScript run directly by Node (no build step, no `ts-node`) — Node strips the types itself, which needs **Node >= 22.18** (pinned in `engines`). `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` silences the warning for `.ts` files under a package with no `"type"` field; do not add `"type": "module"` to `package.json`, it would break the CommonJS Metro and Babel configs.

### Git Hooks (Husky)
- **`pre-commit`**: runs `pnpm run checks` (deps:fix → lint:fix → type:check → test → i18n:check → doctor); blocks on failure
- **`commit-msg`**: validates format `type(scope?): description` (types: `feat`, `fix`, `update`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `improve`)
- Auto-installs via `prepare` script after `pnpm install`

### Releases (`release-it`)
- **Automatic on every push to `main`** (`.github/workflows/release.yml`): the bump is inferred from conventional commits since the last `v*` tag — `feat` → minor, `type!:` / `BREAKING CHANGE:` → major, `fix`/`perf`/`update`/`improve`/`refactor`/`revert`/`build` → patch, only `docs`/`style`/`test`/`ci`/`chore` → no release. It runs lint → type:check → test → bumps `package.json` → writes `CHANGELOG.md` → `docs:badges` → commits `chore(release): vX.Y.Z` → tags → pushes → publishes the GitHub release. Force a bump from Actions → Release → Run workflow.
- Locally: `pnpm run release` (same flow, interactive) or `pnpm run release:dry`. Config: `.release-it.json` (+ `@release-it/conventional-changelog`). Set `GITHUB_TOKEN` (e.g. `gh auth token`) or release-it opens the prefilled release page in the browser.
- If `main` is branch-protected, allow `github-actions[bot]` to push.
- A version bump is a new runtime (`runtimeVersion: appVersion`): ship it with a new build, not only an OTA update.

### MCP servers (`.mcp.json`)
- Project-scoped MCP servers for Claude Code. Currently Atlassian (`https://mcp.atlassian.com/v2/mcp`, OAuth on first use — no credentials in the file). Never commit tokens here; servers needing secrets read them from the environment.

### Commit Message Format

```
type(scope?): description
```

Examples:
- `fix: fixed a minor bug in btn`
- `update: updated login screen layout`
- `feat(auth): add biometric login`
- `chore(deps): update dev dependencies`

### EAS Lifecycle

**First Release (App Store / Play Store):**
1. `pnpm run checks` — verify everything passes
2. `git push` — push code to github
3. `pnpm run flow:build-ios:main` / `pnpm run flow:build-android:main` — trigger EAS workflow build
4. `pnpm run submit:ios` / `pnpm run submit:android` — submit build to stores

**Subsequent Updates (OTA — no resubmission):**
1. `pnpm run checks` → `git push`
2. `pnpm run flow:build-ios:main` / `pnpm run flow:build-android:main`
3. `pnpm run eas:update:prod` — push OTA update

**Preview / Testing:**
1. `pnpm run flow:build-ios:prev` / `pnpm run flow:build-android:prev`
2. `pnpm run eas:update:prev` — push OTA update to preview channel

### EAS Build Profiles
| Profile       | Distribution  | Channel     | Use Case 
|---------------|---------------|-------------|---------------------------
| `development` | Internal(APK) | development | Dev client builds for local testing 
| `preview`     | Store (APK)   | preview     | Internal QA builds 
| `production`  | Store (AAB)   | production  | App Store / Play Store release 

## Essentials

How: Essential Rules

### Imports & Modules
- ✅ DO use absolute imports: `@/components/ui`, `@assets/images/expo_icon_dark.svg`
- ✅ DO use `color` prop on lucide icons, never `className` (`color={text}`, `color={muted}`)
- ✅ DO use `cn()` for className merging (`cn('flex-1', focused && 'bg-primary/10')`)
- ✅ DO use dynamic `import()` for native modules that may be absent on web (`import('expo-dynamic-app-icon')`)
- ✅ DO use `Linking.openURL` with plain string URLs for deep links
- ✅ DO use inline type imports — `import { type Foo }` not `import { Foo }` (`ts/consistent-type-imports`)
- ✅ DO use `type` over `interface` for type definitions (`ts/consistent-type-definitions`)
- ❌ DO NOT nest component definitions inside other components (`react/no-nested-component-definitions`)
- ❌ DO NOT use `cloneElement` — use render prop pattern instead (`react/no-clone-element`)

### State & Data
- ✅ DO use Zustand for client state, persisted through `StorageService` (`src/storage`, expo-secure-store)
- ✅ DO use TanStack Query for server state with staleTime 5min
- ✅ DO use arrow selectors for perf: `useAuthStore((s) => s.isAuthenticated)`
- ✅ DO use TanStack Form + Zod for form validation (not react-hook-form)
- ✅ DO persist through `StorageService` (`src/storage`) — expo-secure-store on native, localStorage on web. Never AsyncStorage, never plain files for tokens. Keep values small (~2 KB iOS limit) and keys `[A-Za-z0-9._-]`
- ❌ DO NOT set state synchronously in `useEffect` — use lazy initializer: `useState(() => readAllKeys())`
- ✅ DO subscribe to Zustand with per-field selectors — never destructure the whole store (`useThemeStore()` with no selector re-renders on every change)
- ✅ DO debounce rapid-fire query inputs with `useDebounce` (see `SearchScreen`) and pair with `placeholderData: keepPreviousData`

### UI & Styling
- ✅ DO use custom components from `@/components/ui/` (`Text`, `Button`, `Input`, `BottomSheet`)
- ✅ DO use `useThemeColors()` for dynamic colors in icons and SVG
- ✅ DO use `t()` from `useTranslation()` for all user-facing strings (never hardcode)
- ✅ DO use kebab-case for filenames (`unicorn/filename-case`)
- ✅ DO extract components when a function exceeds 110 lines (`max-lines-per-function`)
- ✅ DO cap function params at 3; use options object beyond that (`max-params`)
- ✅ DO write React Compiler–compatible code (`react-compiler/react-compiler`)
- ✅ DO use spring presets from `@/config/motion` (`SPRING_PRESS`, `SPRING_GENTLE`) — never inline `{ damping, stiffness, mass }` literals
- ✅ DO defer chart mounting with `useChartReady(order)` (`requestIdleCallback` + stagger — `InteractionManager` was removed in RN 0.88) and keep chart `animationDuration` short — gifted-charts animates on the JS thread
- ✅ DO wrap a chart in `ChartContainer` (or `GalleryTile` on the report screen) so title, legend and loading skeleton stay consistent
- ✅ DO measure chart containers with `useChartWidth()` — gifted-charts needs an explicit pixel `width`
- ❌ DO NOT mount every chart of a showcase at once — gate them behind a category picker like `ChartsShowcase` does
- ✅ DO use `GlassView` (or the `glass` variants) for frosted surfaces — never fake blur with translucent backgrounds
- ✅ DO use `NAV_TITLE_MAP` from `@/config/navigation` for header title keys (single source, derived from `NAV_ITEMS`)
- ✅ DO add `tab` field to `NavItem` with `name`, `icon`, and `order` when adding a bottom tab route — tabs render sorted by `order`
- ❌ DO NOT use raw `Text`/`Pressable` from `react-native` — use wrapped versions
- ✅ DO use `Pressable` instead of `TouchableOpacity` / `activeOpacity`
- ❌ DO NOT modify `android/` or `ios/` directly — use Expo config plugins

### Build & Config
- ✅ DO set `process.env.EXPO_ROUTER_APP_ROOT = './app'` and `EXPO_ROUTER_IMPORT_MODE = 'sync'` at the top of `metro.config.js`
- ✅ DO use `pnpm` for package management (no `package-lock.json` or `yarn.lock`)
- ❌ DO NOT edit `expo-env.d.ts` or `.expo/types/` — they are auto-generated

### Documentation Sync
- ✅ DO update the corresponding `.md` files in the **same change** as any code change — docs are the single source of truth for agents and must never drift from the code
- ✅ DO update `DESIGN.md` when a component/behavior changes: new/renamed props or variants, motion/physics changes, new design tokens, new components, or changed API/size/spacing
- ✅ DO update `CLAUDE.md` when conventions change (imports, naming, state, UI rules, commands, routing structure, file organization)
- ✅ DO update `README.md` / `docs/` when user-facing or project-level behavior changes (commands, setup, scripts, structure)
- ✅ DO add/remove i18n keys in `src/i18n/locales/{en,fr}/` whenever screens or strings change (see `## i18n`)
- ❌ DO NOT close a task that changed code without also committing the related doc updates — treat docs as part of the diff, not an afterthought

### Relaxed Rules (allowed by config)
- `console.log` / `console.warn` — allowed for debugging (`no-console: off`)
- `require()` — allowed in metro configs and mocks (`ts/no-require-imports: off`)
- Inline styles — allowed (`react/no-inline-styles: off`)
- Forward references — allowed (`ts/no-use-before-define: off`)
- `useRef` without exhaustive deps — allowed (`react-hooks/refs: off`)
- Conditional assignments — allowed (`no-cond-assign: off`)

## Conventions

### Naming
- **Files**: kebab-case (`src/screens/login-screen.tsx`, `components/ui/button.tsx`)
- **Routes**: Expo Router (`_layout.tsx`, `settings.tsx`, `app/(auth)/login.tsx`)
- **Components**: PascalCase (`Button`, `BottomSheet`, `Loading`)
- **Functions/vars**: camelCase (`setMode`, `changeLanguage`, `hydrate`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`, `THEME_OPTIONS`)
- **Store slices**: camelCase with `Store` suffix (`useAuthStore`, `useThemeStore`)
- **Assets**: lowercase a-z, numbers 0-9, underscores only (`loading_animation_blue.json`, `expo_icon_dark.svg`)

### Exports
- **Page components**: default export (`export default function Screen`)
- **Reusable components**: named export (`export { Button, BottomSheet }`)
- **Utilities**: named export (`export function cn`)
- **Stores**: named export (`export { useAuthStore }`)
- **Types**: `export type { ... }`
- **Demo/section sub-components**: named export for reusable pieces; internal sub-components stay co-located (same file) for screens that would exceed the 110-line function limit

### Function Size & Refactoring
- ESLint enforces `max-lines-per-function: 110` — extract demo sections, form fields, and card lists into separate components when a screen exceeds this limit
- Each extracted component owns its own state; screens become thin orchestrators that only render sub-components
- **Constructor params**: capped at 3 (`max-params` rule). Use an options object (`{ status, code?, data? }`) for constructors needing more than 3 args
- **No setState in effects**: initialize state with lazy initializer (`useState(() => readAllKeys())`) instead of calling `setState` synchronously in `useFocusEffect` / `useEffect`
- **No unused vars**: remove destructured values that aren't used; the rule requires unused vars to match `/^_/u`

### UI Components
- Use custom components from `@/components/ui/` (`Text`, `Button`, `Input`, `BottomSheet`) instead of `Text` and `Pressable` from `react-native`
- Custom components support `variant`, `className`, and proper theme tokens — never use raw `react-native` components for UI
- Import from barrel (`@/components/ui`) where available, not individual paths — ESLint enforces `perfectionist/sort-imports` and `import/no-duplicates`

### Cross-Platform (Web + iOS + Android)
- **Icons** (lucide-react-native): always use `color` prop, never `className` — `className` colors don't work on native. Use `useThemeColors()` to get hex values: `color={text}`, `color={muted}`
- **Spacing**: test on all platforms — drawer/header items may need explicit `ml`/`mr` margins on native that web handles via CSS
- **SafeArea**: always wrap screens in `SafeAreaView` or use `useSafeAreaInsets()` — not needed on web but critical on native
- **Drawer/Header**: drawer header buttons need explicit margins (`ml-3`, `mr-3`) on native
- **ScrollViews**: use `contentContainerStyle` not `className` for background colors on scroll containers
- **SVG**: hardcoded hex colors (`#ffffff`) won't follow theme — use `useThemeColors()` or CSS variables for dynamic theming
- **Image**: always include `contentFit` prop and `style={{ height: '100%', width: '100%' }}` — without these, the image only renders on web and shows blank on native
- **Numeric style values**: `borderRadius`, `borderWidth` and other length props take numbers on native — a CSS string like `'100px'` works on web but Android throws `Value for borderRadius cannot be cast from String to double`. Use `borderRadius: 40` (half the size for a circle) or a `rounded-*` class
- **Web-only libraries**: anything that renders DOM elements (`div`, e.g. `@tanstack/react-query-devtools`) must be gated with `isWeb` from `@/utils/platform` — on native it crashes the whole tree with `View config getter callback for component 'div'`
- **Web-only classes still compile on native**: Uniwind processes every class string at build time, including ones inside `Platform.select({ web: … })`. It can't evaluate `calc()` that mixes `%` with other units (`h-[calc(100%-1px)]` → `Invalid calc, you can't mix % with other units`) — use a plain utility such as `h-full` instead
- **BottomSheet**: `@gorhom/bottom-sheet` needs `GestureHandlerRootView` wrapper — already in root layout
- **RTL**: not supported — Arabic removed from language options

### Imports
- `@/` path alias maps to `./src/` (tsconfig paths)
- `@assets/*` path alias maps to `./assets/*` (tsconfig + Metro resolver)
- Absolute imports: `import { cn } from '@/lib/utils'`
- URL polyfill (entry): `import 'react-native-url-polyfill/auto'`
- Store selectors for perf: `useAuthStore((s) => s.isAuthenticated)`
- Navigation config: `import { NAV_ITEMS, NAV_TITLE_MAP, NAV_TAB_ITEMS } from '@/config/navigation'`
- Permission module: `import { usePermissionsStatus, checkAllPermissions } from '@/permissions'`

### TypeScript
- Strict mode, TSX for components, `.ts` for utilities
- Prefer inline types over redundant interfaces for simple objects
- `React.ComponentProps<typeof Component>` + `React.RefAttributes` for wrapper props

## Tech Stack


| Category        | Library 
|-----------------|-------------------------------
| Framework       | React 19.3 + React Native 0.88 
| Platform        | Expo SDK 58 
| Language        | TypeScript 6 (strict) 
| Package Manager | pnpm 10 (`node-linker=hoisted`)
| Routing         | Expo Router (Stack/Drawer/Tabs) 
| Styling         | Tailwind CSS v4 + Uniwind + cn() (`cn` package) 
| Theme           | oklch CSS variables (light/dark + 7 accent color palettes) 
| Client State    | Zustand 5 (persisted via `StorageService`) 
| Server State    | TanStack Query 5 + Devtools (web dev only, opt-in: `EXPO_PUBLIC_QUERY_DEVTOOLS=1`) 
| Forms           | TanStack Form 1 + Zod 3 
| Storage         | expo-secure-store (Keychain / Keystore; localStorage on web) 
| i18n            | i18next 27 + react-i18next 18 (EN/FR) 
| UI Primitives   | @rn-primitives 1.5 (Portal, Slot, Dialog, etc.) 
| Bottom Sheet    | @gorhom/bottom-sheet 5 
| Icons           | lucide-react-native (icon data via `lucide`) 
| Icon Morphing   | morphicons (MorphIcon) 
| HTTP            | Axios (auth interceptor, refresh queue) 
| Animation       | react-native-reanimated + gesture-handler 
| Font            | @expo-google-fonts/inter (4 weights, via expo-font plugin) 
| Linting         | Eslint 
| Git hooks       | Husky
| Dates           | date-fns
| Charts          | react-native-gifted-charts + react-native-svg (17 chart types)
| Calendar        | react-native-calendars
| Video           | expo-video (native) / HTML `<video>` (web)
| QR Code         | react-native-qrcode-svg
| Audio           | expo-audio (playback + recording)
| Blur / Glass    | expo-blur (GlassView — iOS/Android/web)
       
             

## Routing Structure
```
app/
├── _layout.tsx          — Root: GestureHandler, SafeAreaProvider, Query, Theme, StatusBar, Splash, SystemUI, PortalHost, Stack
├── index.tsx            — Auth redirect (→ login or home)
├── +not-found.tsx       — 404
├── +html.tsx            — Web HTML shell
├── (auth)/
│   ├── _layout.tsx      — Auth stack (no header, redirect if authed)
│   └── login.tsx        — Login screen
└── (app)/
    ├── _layout.tsx      — Drawer (left PanelLeftOpen via custom Pressable) + auth guard
    ├── report.tsx       — Drawer-only report route
    ├── dev-preferences.tsx — Dev-only preferences
    ├── dev-onboarding.tsx  — Dev-only onboarding
    └── (tabs)/
        ├── _layout.tsx  — Tabs (Search, Report, Home, Settings, Device Info) sorted by tab.order
        ├── index.tsx    — Home tab (floating center button)
        ├── search.tsx   — Search tab
        ├── profile.tsx  — Profile tab (drawer only, hidden from tabs)
        ├── report.tsx   — Report tab (summary sections + the full chart gallery)
        ├── settings.tsx — Settings tab
        └── device-info.tsx — Device info tab
```

## File Organization
```
__tests__/            — Jest: architecture/ guards, components/, config/, hooks/, storage/, utils/, validation/, setup/ (mocks), tsconfig.json
.maestro/             — Maestro E2E: smoke/, auth/, navigation/, subflows/, scripts/ (see .maestro/README.md)
docs/                 — TESTING, LOCAL_BUILDS, UPGRADING, SECRETS, MOBILE_QA_CHECKLIST, AUTOMATION, PERFORMANCE
script/               — Node TS scripts: guard-node-modules, create-env-files, fix-deps, check-setup, check-deps, upgrade-expo, bundle-report, build-local-android, optimize-images, check-locale-parity, check-jest-discovery, perf-device, render-icons · lib/ (dependency-alternatives, device-perf, i18n-placeholders, icon-variants, spawn)
.github/              — workflows: ci, e2e, maintenance (weekly deps + bundle report), react-doctor, release · scripts/maestro-e2e.sh · dependabot.yml (Actions only)
src/
├── permissions/       — Centralized permission hooks + utils (usePermissionsStatus, loadExpoNotifications, etc.)
├── api/              — Axios client, typed hooks (useLogin, usePosts, etc.)
├── components/
│   ├── common/       — Loading, ErrorFallback, SettingRow, InfoRow, PostCard
│   ├── drawer/       — DrawerHeaderLeft, DrawerHeaderRight, DrawerProfileHeader, HeaderTitle, AppDrawerContent
│   ├── home/         — Demo components for component showcase (cards-demo, overview-cards, extended-demos, etc.)
│   ├── report/       — Report screen components (ReportTabs, ReportSection, HoursDistribution, UnifiedProjects, ProjectsAllocationList, ChartsShowcase + GalleryTrends/Comparison/Distribution/Progress, GalleryTile)
│   ├── test/         — Test/demo playground (AdaptiveSlider calories, AnimatedNumber/NumberFlow, ChangeablePricingSection)
│   └── ui/           — Button, Text, Input, BottomSheet, Badge, Switch, Checkbox, RadioGroup, Slider, Spinner, Image, Progress, Toggle, Modal, Calendar, DateTimePicker, Video, WebView, QRCode, Menu, TextArea, MaskedView
├── config/           — Constants, env helpers, color-palettes.ts (7 palettes)
├── data/             — Mock data (report.ts: projects, hours trend per range, sprint velocity, team throughput, activity heatmap, goals, work breakdown)
├── hooks/            — Shared hooks (useThemeColors, usePrimaryHex, useDebounce, useGooeyPress, useChartReady, useChartWidth)
├── i18n/             — i18next setup + locales/{en,fr}/
├── providers/        — QueryProvider, ThemeProvider (Uniwind.setTheme + nav theme), AuthProvider
├── screens/          — LoginScreen, HomeScreen, SearchScreen, ProfileScreen, SettingsScreen, OnboardingScreen, ReportScreen, PreferencesScreen, PostDetailScreen, DeviceInfoScreen
├── storage/          — StorageService: expo-secure-store (native) / localStorage (web), sync API over an in-memory cache, key index, iOS reinstall wipe
├── store/            — Zustand stores (authStore, themeStore, onboardingStore) persisted via StorageService
├── types/            — Global type declarations (uniwind.d.ts)
├── utils/            — cn utility, format helpers, platform helpers, chart.ts (axis/track colors, niceAxisMax)
├── widgets/          — android/ios widget
├── validation/       — Zod schemas (login, register, forgotPassword)
assets/
src/style/global.css  — Tailwind v4 entry + CSS vars (oklch light/dark, @variant)
```

## State Management
- **Zustand**: Auth tokens/user, theme mode, onboarding state. Persisted via `StorageService` (expo-secure-store). Hydrated on app boot via `hydrate()` call (not module-level).
- **TanStack Query**: Server data with staleTime 5min, gcTime 30min, retry 2.
- **Selectors**: Use arrow selectors for re-render perf: `useAuthStore((s) => s.isAuthenticated)`

## Theme System
- CSS variables in `src/style/global.css` (oklch colors, `@variant light` / `@variant dark`)
- `ThemeProvider` syncs Zustand `themeStore.mode` → `Uniwind.setTheme()` + React Navigation theme
- Modes: `light`, `dark`, `system` (follows `Appearance`)
- **Accent Colors**: 7 palettes (blue, purple, green, orange, red, teal, pink) defined in `src/config/color-palettes.ts`; `themeStore.primaryColor` persisted via `StorageService`
- `ThemeProvider` calls `Uniwind.updateCSSVariables(theme, vars)` on boot + palette change to inject palette-specific CSS vars
- All screens use CSS variables (`bg-primary`, `text-primary`, `bg-primary/10`, etc.) instead of hardcoded colors — changing accent color propagates instantly
- Persisted via `StorageService` (expo-secure-store)
- `expo-system-ui` background color synced on theme change

## i18n
- 2 languages: English, French
- Namespaces: `common`, `auth`, `audio`, `post-detail`, `preferences`, `report`, `search`, `settings`, `user-menu` — register a new one in both `resources` and the `ns` array in `src/i18n/index.ts`
- Language persisted via `StorageService`
- `changeLanguage(lang)` updates i18next + persists via `StorageService`
- RTL not supported — Arabic removed from language options
- **When adding or removing pages**: Always add/remove corresponding translation keys in `src/i18n/locales/{en,fr}/` for all user-facing strings

## Auth Flow
1. App boots → `SplashScreen.preventAutoHideAsync()`
2. `RootLayout` → setup i18n → `setupI18n()`
3. `RootLayoutInner` → hydrate auth + theme + onboarding stores from `StorageService`
4. When i18n ready + stores hydrated → `SplashScreen.hideAsync()`
5. Auth guard in `(app)/_layout.tsx` → redirects to `/(auth)/login` if not authenticated
6. LoginScreen → `authStore.login()` (demo mode: sets mock token)
7. After login → router replaces to `/(app)/(tabs)`
8. Tokens stored in expo-secure-store (`StorageService.auth`), attached via Axios interceptor, refresh queue for 401s

## Navigation Patterns
- **Left Drawer**: single `(tabs)` route group, accessible via custom `PanelLeftOpen` Pressable in header (calls `navigation.toggleDrawer()`)
- **Drawer-only routes**: Features — registered under `(app)/` (not inside `(tabs)`), no bottom tab
- **Report routes**: `report` appears both as a drawer-only route (full-page report) and a tab route (compact chart view)
- **Bottom Tabs**: Search, Report, Home, Settings, Device Info with lucide icons — sorted by `tab.order` from `src/config/navigation.ts`
- **Profile tab**: drawer-only (route exists at `app/(app)/(tabs)/profile.tsx` but excluded from bottom tab bar)
- **Auth guard**: redirect logic in `(app)/_layout.tsx` (check `isAuthenticated`, replace to login if false)
- **Header**: custom `headerLeft` with `PanelLeftOpen` icon via Pressable positioned at `ml-3`

## Component Patterns
- All UI components use `className` + `cn()` for styling with Tailwind classes
- `BottomSheet<T>` — generic bottom sheet built on `@gorhom/bottom-sheet` v5 with `enablePanDownToClose`, backdrop, `index` prop (`-1` closed, `0` open), sticky handle
- `Badge` — variants (default/primary/secondary/destructive/outline), sizes (xs/sm/md/lg)
- `Text` — variants (h1-h4, body/large/small, caption, label)
- `Input` — styled input with label, error, icon support; built-in `type` prop: `search`, `phone`, `username`, `password` (with Eye toggle), `email`
- `Switch` — toggle switch with primary color theming
- `Checkbox` — checkbox with checkmark icon
- `RadioGroup` / `RadioGroupItem` — radio button group
- `Slider` — gesture-driven slider with reanimated
- `Spinner` — ActivityIndicator with size variants (sm/md/lg)
- `Image` — expo-image wrapper with fallback
- `Progress` — in-house (react-native-svg + Reanimated, no extra dependency, same on web): `Progress.Bar`, `Progress.Pie`, `Progress.Circle` (determinate ring or `indeterminate` spinner), `Progress.CircleSnail` (spinner cycling through a `color` array); spinners stop under reduced motion
- `Toggle` — pressed-state toggle button (on/off)
- `Toast` — wrapper around `react-native-toast-message-ts` with `showToast({ variant, title, message })`, variants: `success`/`error`/`info`. Mounted in root layout, callable from anywhere.
- `Modal` — custom modal with 3 variants: `bottom-sheet` (slides up), `centered` (scales in with icon/title/description), `centered-action` (centered + action buttons). Uses `react-native-reanimated` for enter/exit animations. Backdrop fades, sheet slides/scales independently.
- `Calendar` — date picker built on `react-native-calendars` with marked dates
- `DateTimePicker` — date/time field built on `@react-native-community/datetimepicker`
- `VideoPlayer` — video player using `expo-video` (native) or `<video>` HTML element (web); `react-native-video` removed due to Android media3 version conflict — use `expo-video` for all video needs
- `QRCodeView` — QR code generator using `react-native-qrcode-svg`
- `Menu` — context/popup menu using `@react-native-menu/menu`
- `TextArea` — multiline text input with character count
- `PermissionSection` — settings section with toggle rows for Notification, Camera, Location permissions; uses `SettingGroup`/`SettingRow` pattern with `Badge` + `Switch` in right-element area
- `PermissionCards` — home screen demo cards for permission usage: send test notification, take camera photo, get GPS coordinates. Calls `usePermissionsStatus` **once** and passes the instance down to its cards — never per-card.
- `GlassView` — cross-platform frosted glass (`expo-blur`): `intensity` (`subtle`/`medium`/`strong` or 1–100), `tint` (`auto`/`light`/`dark`), `bordered`. Powers the `glass` variants on `Button`, `Card`, `Badge`, and the `glass` prop on `BottomSheet`. Use over colorful/image content only.
- `Card` — supports `effect="gooey"` on pressable cards (squash/stretch press via the shared `useGooeyPress` hook)
- `ChartContainer` — title/subtitle/legend/footer framing for a single chart, with a `loading` skeleton of `height`
- Charts — gifted-charts wrappers (`ChartPie`, `ChartBars`, `ChartColumn`, `ChartLine`, `ChartArea`, `ChartStacked`, `ChartStackedArea`, `ChartCandlestick`), SVG-drawn charts (`ChartPolarArea`, `ChartRadialBar`, `ChartProgressRing`, `ChartRadar`, `ChartScatter` with a `bubble` mode) and layout-only charts (`ChartHeatmap`, `ChartTreemap`). See `DESIGN.md` for the full contract.

## Important Packages
- `@gorhom/bottom-sheet` (v5) — native gesture-driven bottom sheet with snap points
- `@rn-primitives/*` (v1.5) — headless UI (Portal, Dialog, Slot, etc.)
- `uniwind` (v1.14) — Tailwind v4 runtime for RN (≥ 1.13.2 needed on web: 1.11–1.12 miss `InputAccessoryView` and the web bundle fails)
- `cn` — shadcn's compiled clsx + tailwind-merge in one dependency-free package; `src/utils/cn.ts` re-exports it
- `@tanstack/react-query` (v5) — server state + devtools
- `@tanstack/react-form` (v1) + `zod` (v3) — form validation
- `zustand` (v5) — client state, persisted via `StorageService`
- `expo-secure-store` — encrypted key/value storage (Keychain / Keystore); backs `StorageService`
- `i18next` (v27) + `react-i18next` (v18) — i18n (v27 removed `compatibilityJSON`; `fallbackLng` must be set — it is `en`)
- `lucide-react-native` — icons
- `axios` — HTTP client with interceptors
- `expo-splash-screen` — splash screen lifecycle
- `expo-system-ui` — system background color sync
- `expo-status-bar` — status bar component
- `react-native-safe-area-context` — SafeAreaProvider + useSafeAreaInsets
- `react-native-url-polyfill` — URL polyfill for fetch
- `react-native-reanimated` + `react-native-gesture-handler` — animations + gestures
- `expo-video` — video player
- `expo-audio` — audio playback + recording
- `react-native-qrcode-svg` — QR code generation
- `react-native-calendars` — calendar date picker
- `react-native-gifted-charts` — chart library (PieChart, BarChart)
- `@react-native-community/datetimepicker` — native date/time picker
- `@react-native-menu/menu` — context/popup menu
- `expo-blur` — frosted glass surfaces (`GlassView` wrapper; Android via `blurMethod="dimezisBlurView"`, web via CSS backdrop-filter)

## Notes
- **Tests**: Jest 30 + React Native Testing Library 14 (`__tests__/`, two projects — `node` for `*.test.ts`, `rn` for `*.test.tsx`) and Maestro E2E (`.maestro/`). Architecture guards in `__tests__/architecture/` enforce route declaration, removed RN APIs, Maestro IDs, the Metro blockList, `.easignore`, `eas.json` env and locale parity. See `docs/TESTING.md` and `.maestro/README.md`.
- `__tests__/` has its own `tsconfig.json` (Jest + Node types) and is excluded from the root config, like `script/`. Interactive elements a flow drives get a kebab-case `<screen>-<element>` `testID`.
- `expo-env.d.ts` and `.expo/types/` are auto-generated — do not edit
- `script/` is excluded from the root `tsconfig.json` and from ESLint, and is type-checked separately via `script/tsconfig.json` (`types: ["node"]`). Node globals must not leak into the app config — `process` and the timer types differ from React Native's. TypeScript 6 no longer auto-includes `@types/*`, so any new Node script needs to live under `script/` to get them.
- `src/types/uniwind.d.ts` patches TypeScript 6 compatibility with uniwind types
- `app.config.ts` inlines all env values (no separate env.ts loaded during config resolution to avoid Node ESM `.ts` issues)
- Use `pnpm` for package management only — don't add `package-lock.json` or `yarn.lock`
- `StorageService` creates its backend lazily (first read/write), so importing it never touches native code during SSR or tests. Reads are synchronous through an in-memory cache (one `SecureStore.getItem` per key per launch); writes update the cache and persist with `setItemAsync`. SecureStore cannot list keys, so each namespace keeps a `<ns>.__keys` index. The iOS Keychain survives uninstall — a marker file in the document directory detects a fresh install and wipes Keychain leftovers on its first launch.
- **File watching on Windows** — Expo CLI defaults `useWatchman` to false, so Metro falls back to one `fs.watch` per directory and crashes with `EMFILE: too many open files, watch`. `metro.config.js` uses Watchman when it is installed (recommended: `choco install watchman`); without it, on Windows it switches Metro to its recursive `NativeWatcher` and ignores EPERM/EBUSY from locked files. Force either with `EXPO_USE_WATCHMAN=1|0`. It also blocklists `android/`, `ios/`, `dist/`, `build/`, `coverage/`, `.git/` — the blockList escapes each path segment separately so it matches `\` and `/` (guarded by `__tests__/architecture/metro-config.test.ts`).
- **Never modify `node_modules` while it is in use (Windows)** — an open file can't be deleted, so a `pnpm install` / `pnpm add` / `deps:fix` that overlaps Metro, a Gradle build, Watchman or a second pnpm dies with `EBUSY` / `ENOTEMPTY` and leaves `node_modules` half-written (missing `.bin` links such as `eslint`, duplicate native modules flagged by expo-doctor). `script/guard-node-modules.ts` (`pnpm run guard`) refuses to proceed while another pnpm, this project's `expo start` / `expo run:*`, or a Gradle build is running, and clears the safe locks itself: idle Gradle/Kotlin daemons and Watchman's watch on this project. `deps:fix`, `install:safe` and `setup` run it first; it is also registered as `pnpm:devPreinstall`, but that hook — like Husky's `prepare` — does not run when `ignore-scripts=true` is set in the user's `.npmrc`, so use `pnpm run install:safe` over a bare `pnpm install`. Skipped when `CI` / `EAS_BUILD` is set; override with `SKIP_INSTALL_GUARD=1`. If `node_modules` is already broken, delete it and reinstall — a partial repair can leave duplicates.
- **Dev build, not Expo Go** — native modules (expo-secure-store, camera, notifications, …) mean the app runs in an `expo-dev-client` build. Build it with `npx expo run:android --device <avd-name>` — `--device` takes the **AVD name** (`emulator -list-avds`), not the adb serial `emulator-5554`. Rebuild after any native dependency or config-plugin change (an Expo SDK bump counts); otherwise `pnpm run android:dev` is enough. The dev client targets Metro on 8081 — if another project's Metro holds that port the app loads the wrong bundle and renders blank, so use `--port 8082` or stop the other server.
- iOS runs Hermes (SDK 58 default) — do not add `jsEngine`/`newArchEnabled` keys to `app.config.ts`; they no longer exist in the config type
- Drawer and Tabs only register screens **declared in their layout** (Expo Router SDK 58). Adding a route file under `app/(app)/` means adding it to `DRAWER_ROUTES` in `app/(app)/_layout.tsx`; a non-tab route under `(tabs)/` needs a plain `<Tabs.Screen name="…" />` (the custom tab bar draws no button for routes without a tab config). **Never `href: null`**: since expo-router 58.0.3x it marks the screen hidden, and navigating to it redirects to the first tab (guarded by `routes-declared.test.ts`). An undeclared route is unreachable.
- Do not use `NAV_ITEMS`/`__DEV__` to decide which drawer screens are registered — register every route file and let the drawer content decide visibility.
- Avoid RN 0.88 removed APIs: `InteractionManager` (use `requestIdleCallback`), the `Touchable` root export, `Modal`'s `animated` prop, `StatusBar` `backgroundColor`/`translucent`, and deep imports from `react-native/Libraries/*` (now type errors). `ImageBackground` is deprecated — use a `View` with an absolutely positioned `Image`.
- Drawer and Tabs must NOT freeze inactive screens — neither `freezeOnBlur: true` (a no-op since SDK 58) nor its replacements `activityEnabled` / `NavigationAwareActivity`. Uniwind resolves `className` styles at render and only re-renders via a `UniwindListener` subscription registered in a layout effect. A frozen screen tears that subscription down, misses the `Uniwind.setTheme()` / `updateCSSVariables()` notification, and — because React Compiler memoizes the subtree — never recomputes on unfreeze. The result is a screen stuck on the theme it had when it was first mounted until the app reloads.
- **Keep Expo Go working** — Expo Go only ships Expo SDK modules plus a fixed set of community ones. Before adding a native library, prefer the `expo-*` equivalent (permissions via each module's own `get*/request*PermissionsAsync`, restart via `expo-updates` `reloadAsync()`, network via `expo-network`). A module Expo Go lacks crashes the whole route tree on import (`TurboModuleRegistry.getEnforcing(...) could not be found`), which also shows up as "Route … is missing the required default export" warnings. If one is unavoidable, load it with a guarded dynamic `import()` and document that the feature needs a dev build. `react-native-permissions`, `react-native-restart-newarch` and `react-navigation-header-buttons` were removed for this reason (permissions now live in `src/hooks/use-permissions-status.ts`).
- `ActivityIndicator` in Uniwind doesn't support `className` color — use native `color` prop with hex fallback

## CI/CD

### EAS Build (`eas.json`)
| Profile       | Distribution | Channel     | Use Case
|---------------|--------------|-------------|---------------------------
| `development` | Internal     | development | Dev client builds for local testing 
| `preview`     | Store (APK)  | preview     | Internal QA builds 
| `production`  | Store (AAB)  | production  | App Store / Play Store release 
 

- `autoIncrement: true` on `preview` and `production` — EAS auto-bumps build numbers
- `appVersionSource: "remote"` — version numbers managed by EAS
- Every profile sets every `.env.example` key in its `env` block (`EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_ENABLE_ANALYTICS`, `EXPO_PUBLIC_ENABLE_CRASH_REPORTING`, `EXPO_PUBLIC_QUERY_DEVTOOLS`) — cloud builds never see local `.env.*` files. Guarded by `__tests__/architecture/eas-env.test.ts`.
- Build commands: `pnpm run build:prev:ios`, `pnpm run build:prod:android`, etc. Local, no-EAS APK: `pnpm run build:local:android` (`docs/LOCAL_BUILDS.md`).

### EAS upload filter (`.easignore`)
- When `.easignore` exists EAS CLI uses it **instead of every `.gitignore`**. It therefore repeats every `.gitignore` pattern verbatim (section "Mirrored from .gitignore"), and also excludes tests, `.maestro/`, docs, `*.md`, repo tooling, `.env*` and build artifacts.
- `script/` is excluded except `script/guard-node-modules.ts`, which the `pnpm:devPreinstall` hook runs on the builder.
- Guarded by `__tests__/architecture/easignore.test.ts`. Inspect the real archive: `npx eas-cli@latest build:inspect --platform android --stage archive --output ./eas-archive`.

### GitHub Actions CI (`.github/workflows/ci.yml`) — every PR + push to `main`
- `quality`: ESLint, `type:check`, Jest with coverage, `test:discovery`, `i18n:check`, `images:check`
- `secrets`: gitleaks with `.gitleaks.toml`
- `maestro-syntax`: `maestro check-syntax` on every flow, after a self-test proving a malformed flow fails

### GitHub Actions E2E (`.github/workflows/e2e.yml`) — push to `main` + manual
- Debug dev-client APK (x86_64) → Metro via `pnpm run e2e:metro` (pre-warmed) → API 34 emulator → `.github/scripts/maestro-e2e.sh` (logcat, chunked screen recording, JUnit). `maestro-out/` uploads on failure.

### GitHub Actions Release (`.github/workflows/release.yml`)
- Triggers on **push to `main`**
- Reads version from `package.json` → tag `v{version}`
- **New version** → creates GitHub release with auto-generated notes
- **Existing version** → updates release notes with commits since previous release
- Uses `gh` CLI with `GITHUB_TOKEN` (no extra secrets needed)

### Environment Variables
- `.env.development`, `.env.preview`, `.env.production` — per-environment values for **local** runs; git-ignored and EAS-ignored. Cloud builds use the `eas.json` profile `env` (keep both in sync — the `eas-env` test checks keys).
- `.env.example` is the template. `pnpm run env:create` (`script/create-env-files.ts`) generates the three files from it, copying every key verbatim and setting only `EXPO_PUBLIC_APP_ENV` per environment. Existing files are skipped — they may hold local edits — so overwriting needs `--force`. Add any new key to `.env.example` as well, or it will be missing the next time someone generates.
- `src/config/env.ts` — shared constants (`EXPO_PUBLIC_SLUG`, `EXPO_PUBLIC_PACKAGE`, `EAS_PROJECT_ID`)
- EAS profiles inject every `EXPO_PUBLIC_*` key via the `eas.json` `env` block. Never put secrets there or behind `EXPO_PUBLIC_` (`docs/SECRETS.md`).
- Android package: `com.rntemplate.app` (underscores, not hyphens — Android requirement)
