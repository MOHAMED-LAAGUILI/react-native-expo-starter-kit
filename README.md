# React Native Starter Kit

A production-ready [React Native](https://reactnative.dev/) starter built with [Expo SDK 57](https://expo.dev/), [Expo Router](https://expo.dev/router), [Tailwind CSS v4](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/), [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query), and [@gorhom/bottom-sheet](https://github.com/gorhom/bottom-sheet).

## Quick Start

```bash
git clone <repo> my-app
cd my-app
bun install
bun dev
```

Press `i` (iOS), `a` (Android), or `w` (Web). Or scan the QR with [Expo Go](https://expo.dev/go).

## Commands

| Script | Purpose |
|--------|---------|
| `bun dev` | Start Expo dev server (fresh cache) |
| `bun run ios` | Dev server targeting iOS |
| `bun run android` | Dev server targeting Android |
| `bun run web` | Dev server targeting Web |
| `bun run clean` | Remove `.expo`, `node_modules`, `android`, `ios`, `build`, `dist`, `bun.lock` and reinstall |
| `bun run fix:deps` | Fix dependency versions via Expo |
| `bun run doctor` | Run Expo doctor diagnostics |
| `bun run prebuild` | Prebuild native project |
| `bun run check` | Lint + auto-fix via Biome |
| `bun run format` | Format code via Biome |
| `bun run biome` | Lint + format (both) |
| `bun run export` | Export web build |
| `bun run login` | EAS login |
| `bun run logout` | EAS logout |
| `bun run build:development:ios` | EAS dev client build for iOS |
| `bun run build:development:android` | EAS dev client build for Android |
| `bun run build:preview:ios` | EAS preview build for iOS |
| `bun run build:preview:android` | EAS preview build for Android |
| `bun run build:production:ios` | EAS production build for iOS |
| `bun run build:production:android` | EAS production build for Android |
| `bun run start:preview` | Dev server with preview env |
| `bun run start:production` | Dev server with production env |
| `bun run prebuild:preview` | Prebuild with preview env |
| `bun run prebuild:production` | Prebuild with production env |

## Features

- **Expo Router** — File-based routing with Stack, Drawer, and Tab navigators
- **Uniwind + Tailwind v4** — Runtime CSS-in-JS with `className` props, `cn()` utility, dark mode via oklch CSS vars
- **Zustand** — Lightweight client state with MMKV persistence and hydration
- **TanStack Query** — Server state, caching, and auto-refetching (staleTime 5min, gcTime 30min, retry 2)
- **TanStack Form + Zod** — Type-safe form validation
- **Axios** — HTTP client with auth token interceptor and refresh queue
- **i18next** — Internationalization (English, French, Arabic) with RTL support (restart on RTL toggle)
- **MMKV** — High-performance key-value storage (SSR-safe lazy init)
- **Authentication** — Login/register flow with token management, demo mode skip
- **Drawer + Tabs** — Left drawer with hamburger menu header button, bottom tab bar (Home, Search, Profile, Settings)
- **Bottom Sheet** — Reusable bottom sheet component via `@gorhom/bottom-sheet` with snap points, backdrop, pan-to-close
- **Toast** — Notification toasts via `@backpackapp-io/react-native-toast` with success/error/info variants, callable from anywhere via `showToast()`
- **Dark/Light/System theme** — CSS variables in oklch, persisted preference, follows system
- **Accent Color System** — 7 color palettes (blue, purple, green, orange, red, teal, pink) switchable at runtime; all screens (drawer, tabs, profile) react instantly via `Uniwind.updateCSSVariables()`
- **Splash Screen** — Custom splash with auto-hide after i18n + auth hydration ready
- **System UI** — Background color synced with theme mode
- **Cross-platform** — iOS, Android, Web

## Project Structure

```
├── app/                        # Expo Router routes
│   ├── _layout.tsx             # Root: GestureHandler, SafeAreaProvider, Query, Theme, StatusBar, Splash, SystemUI, Stack
│   ├── index.tsx               # Auth redirect (→ login or home)
│   ├── +not-found.tsx          # 404
│   ├── +html.tsx               # Web HTML shell
│   ├── (auth)/                 # Unauthenticated routes
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   └── (app)/                  # Authenticated routes
│       ├── _layout.tsx         # Drawer (left hamburger menu) + auth guard
│       └── (tabs)/             # Bottom tabs
│           ├── _layout.tsx
│           ├── index.tsx       # Home
│           ├── search.tsx
│           ├── profile.tsx
│           └── settings.tsx
├── src/
│   ├── api/                    # Axios client + TanStack Query hooks
│   ├── components/
│   │   ├── common/             # LoadingScreen, ErrorFallback
│   │   └── ui/                 # Button, Text, Input, BottomSheet
│   ├── config/                 # Constants, env helpers, color-palettes.ts
│   ├── hooks/                  # Shared hooks
│   ├── i18n/                   # i18next + locales/{en,fr,ar}
│   ├── providers/              # QueryProvider, ThemeProvider
│   ├── screens/                # Screen components
│   ├── storage/                # MMKV wrapper (SSR-safe, lazy init)
│   ├── store/                  # Zustand stores (authStore, themeStore)
│   ├── types/                  # Type declarations (uniwind.d.ts)
│   ├── utils/                  # cn() utility
│   └── validation/             # Zod schemas (login, register, forgotPassword)
├── global.css                  # Tailwind v4 + Uniwind entry, oklch CSS vars (light/dark)
├── app.config.ts               # Expo config (EAS, plugins, fonts, localization)
├── metro.config.js             # Expo + Uniwind Metro plugin
├── babel.config.js             # module-resolver, reanimated, dotenv
├── eas.json                    # EAS Build profiles
├── biome.json                  # Biome config
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/
        └── release.yml         # GitHub Actions: auto-release on push to main
```

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | React 19 + React Native 0.86 |
| Platform | Expo SDK 57 |
| Language | TypeScript 6 (strict) |
| Routing | Expo Router (Stack/Drawer/Tabs) |
| Styling | Tailwind CSS v4 + Uniwind + cn() |
| Theme | oklch CSS variables (light/dark + 7 accent color palettes) |
| Client State | Zustand 5 (MMKV persistence) |
| Server State | TanStack Query 5 + Devtools |
| Forms | TanStack Form 1 + Zod 3 |
| Storage | react-native-mmkv 4 (lazy, SSR-safe) |
| i18n | i18next 26 + react-i18next (EN/FR/AR, RTL) |
| UI Primitives | @rn-primitives 1.5 (Portal, Slot, Dialog, etc.) |
| Bottom Sheet | @gorhom/bottom-sheet 5 |
| Icons | lucide-react-native |
| HTTP | Axios (auth interceptor, refresh queue) |
| Animation | react-native-reanimated + gesture-handler |
| Font | @expo-google-fonts/inter (4 weights, via expo-font plugin) |
| Linting | Biome 2 |

## Learn More

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Uniwind Docs](https://docs.uniwind.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Form](https://tanstack.com/form/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [i18next](https://www.i18next.com/)
- [@gorhom/bottom-sheet](https://github.com/gorhom/bottom-sheet)

## Deploy

Use [Expo Application Services (EAS)](https://expo.dev/eas) for builds, updates, and submissions.

### EAS Build Profiles

| Profile | Distribution | Channel | Use Case |
|---------|-------------|---------|----------|
| `development` | Internal | — | Dev client builds for local testing |
| `preview` | Store (APK) | preview | Internal QA builds |
| `production` | Store (AAB) | production | App Store / Play Store release |
| `simulator` | — | — | iOS simulator / Android emulator builds |

```bash
# Login to EAS
bun run login

# Build for preview (QA)
bun run build:preview:ios
bun run build:preview:android

# Build for production
bun run build:production:ios
bun run build:production:android

# or use workflow instead of Build
bun run workflow:build-android
bun run workflow:build-ios

# Submit to stores
bun run submit:android
bun run submit:ios
```

- `autoIncrement: true` on `preview` and `production` — EAS auto-bumps build numbers
- `appVersionSource: "remote"` — version numbers managed by EAS
- Environment variables set per-profile in `eas.json`

### GitHub Actions Release

A GitHub Actions workflow (`.github/workflows/release.yml`) automatically manages releases:

- **Triggers** on every push to `main`
- Reads version from `package.json` → creates/updates tag `v{version}`
- **New version** → creates a GitHub release with auto-generated notes
- **Existing version** → updates the release notes with commits since the previous release
- Uses `gh` CLI with `GITHUB_TOKEN` — no extra secrets needed

To release, just bump the version in `package.json` and push to `main`.

### Environment Variables

| File | Purpose |
|------|---------|
| `.env.development` | Local dev values |
| `.env.preview` | Preview/QA builds |
| `.env.production` | Production builds |
| `src/config/env.js` | Shared constants (`EXPO_PUBLIC_SLUG`, `EXPO_PUBLIC_PACKAGE`, `EAS_PROJECT_ID`) |

- Android package: `com.rn_template.app` (underscores, not hyphens — Android requirement)
- EAS profiles inject `EXPO_PUBLIC_APP_ENV` via `eas.json` `env` block

## Roadmap
- **Sentry** — Error tracking and performance monitoring
- **Expo Notifications** — Push notifications with local and remote support
- **Husky** — Git hooks for pre-commit linting and formatting
- **Maestro** — E2E testing framework for mobile
