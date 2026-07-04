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
| `bun run clean` | Remove `.expo` and `node_modules` |
| `bun run fix:deps` | Fix dependency versions via Expo |
| `bun run doctor` | Run Expo doctor diagnostics |
| `bun run prebuild` | Prebuild native project |
| `bun run biome` | Lint + format via Biome |
| `bun run format` | Format code via Biome |

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
- **Dark/Light/System theme** — CSS variables in oklch, persisted preference, follows system
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
│   │   ├── forms/              # FormField
│   │   └── ui/                 # Button, Text, Input, BottomSheet
│   ├── config/                 # Constants, env helpers
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
├── env.ts                      # Shared env constants
├── eas.json                    # EAS Build profiles
├── biome.json                  # Biome config
├── tsconfig.json
└── package.json
```

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | React 19 + React Native 0.86 |
| Platform | Expo SDK 57 |
| Language | TypeScript 6 (strict) |
| Routing | Expo Router (Stack/Drawer/Tabs) |
| Styling | Tailwind CSS v4 + Uniwind + cn() |
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
