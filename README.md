<h1 align="center">
  🚀 RN Starter Kit
</h1>

<p align="center">
  <img width="1280" height="680" alt="RN Starter Kit Banner" src="https://github.com/user-attachments/assets/2e80075b-9131-4e2b-8dcf-42faf9bda0d1" />
</p>

<p align="center">

  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="React Native 0.86" src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black" />
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white" />
  <img alt="TypeScript 6" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Expo Router v5" src="https://img.shields.io/badge/Expo%20Router-v5-000000?logo=expo&logoColor=white" />
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="Uniwind" src="https://img.shields.io/badge/Uniwind-Latest-06B6D4" />
  <img alt="Zustand v5" src="https://img.shields.io/badge/Zustand-v5-764ABC" />
  <img alt="TanStack Query v5" src="https://img.shields.io/badge/TanStack%20Query-v5-FF4154?logo=reactquery&logoColor=white" />
  <img alt="TanStack Form v1" src="https://img.shields.io/badge/TanStack%20Form-v1-FF4154" />
  <img alt="Zod v3" src="https://img.shields.io/badge/Zod-v3-3068B7" />
  <img alt="MMKV v4" src="https://img.shields.io/badge/MMKV-v4-4CAF50" />
  <img alt="Axios" src="https://img.shields.io/badge/Axios-Latest-5A29E4?logo=axios&logoColor=white" />
  <img alt="i18next v26" src="https://img.shields.io/badge/i18next-v26-26A69A" />
  <img alt="Reanimated v4" src="https://img.shields.io/badge/Reanimated-v4-FFCA28" />
  <img alt="Gesture Handler v2" src="https://img.shields.io/badge/Gesture%20Handler-v2-7C4DFF" />
  <img alt="Bottom Sheet v5" src="https://img.shields.io/badge/Bottom%20Sheet-v5-0F172A" />
  <img alt="Lucide Icons" src="https://img.shields.io/badge/Lucide-Icons-F56565" />
  <img alt="RN Primitives v1.5" src="https://img.shields.io/badge/RN%20Primitives-v1.5-111827" />
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-Latest-4B32C3?logo=eslint&logoColor=white" />
  <img alt="Husky Git Hooks" src="https://img.shields.io/badge/Husky-Git%20Hooks-FF6B35" />

</p>


## Demo Android (Old Build)
https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7481391447850717184?compact=1

## Latest APK File
**available only for 13 Days to download start from Jul 13, 2026 2:48 PM**
https://expo.dev/accounts/gopitos-team/projects/rn-template/builds/f3bb082f-af1e-48d6-aea0-174b4c8c3708

## Quick Start
```bash
git clone https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit.git my-react-native-app
cd my-react-native-app
bun install
bun dev
```

Press `i` (iOS), `a` (Android), or `w` (Web). Or scan the QR with [Expo Go](https://expo.dev/go).

## Commands

| Script                                   | Purpose 
|------------------------------------------|--------------------------------------------
| `bun dev`                                | Start Expo dev server (fresh cache)
| `bun run ios`                            | Dev server targeting iOS
| `bun run android`                        | Dev server targeting Android
| `bun run web`                            | Dev server targeting Web
| `bun run clean:app`                      | Clean bun cache, node_modules, native builds, and lockfile
| `bun run mac:ios`                        | Install pods for iOS
| `bun run deps:fix`                       | Fix dependency versions via Expo
| `bun run lint:fix`                       | Run ESLint with auto-fix on all source files
| `bun run type:check`                     | Run TypeScript type checking (no emit)
| `bun run doctor`                         | Run Expo doctor diagnostics
| `bun run checks`                         | Run all checks (deps:fix → lint:fix → type:check → doctor)
| `bun run expo:config`                    | Print public Expo config
| `bun run generate:apk`                   | Build Android APK and install via ADB
| `bun run prebuild`                       | Prebuild native project (all platforms)
| `bun run prebuild:dev`                   | Prebuild native project (development env)
| `bun run prebuild:prev`                  | Prebuild native project (preview env)
| `bun run prebuild:prod`                  | Prebuild native project (production env)
| `bun run prebuild:generate`              | Prebuild native project & generate APK
| `bun run android:dev`                    | Android dev server (development env)
| `bun run ios:dev`                        | iOS dev server (development env)
| `bun run android:prev`                   | Android dev server (preview env)
| `bun run ios:prev`                       | iOS dev server (preview env)
| `bun run android:prod`                   | Android dev server (production env)
| `bun run ios:prod`                       | iOS dev server (production env)
| `bun run eas:in`                         | EAS login
| `bun run eas:out`                        | EAS logout
| `bun run eas:id`                         | EAS reveal connected account
| `bun run build:dev:ios`                  | Build development iOS (EAS)
| `bun run build:dev:android`              | Build development Android (EAS)
| `bun run build:prev:ios`                 | Build preview iOS (EAS)
| `bun run build:prev:android`             | Build preview Android (EAS)
| `bun run build:prod:ios`                 | Build production iOS (EAS)
| `bun run build:prod:android`             | Build production Android (EAS)
| `bun run flow:build-ios:main`            | Trigger EAS workflow to build iOS from github branch named main
| `bun run flow:build-android:main`        | Trigger EAS workflow to build Android from github branch named main
| `bun run submit:android`                 | Submit Android build to Play Store
| `bun run submit:ios`                     | Submit iOS build to App Store
| `bun run eas:update:config`              | Configure EAS Update for the project
| `bun run eas:update:prod`                | Push OTA update to production channel
| `bun run export:web`                     | Export web build locally static files
| `bun run deploy:web`                     | Deploy web build to production


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
│   │   └── ui/                 # Button, Text, Input, BottomSheet ...
│   ├── config/                 # Constants, env helpers, color-palettes.ts
│   ├── hooks/                  # Shared hooks
│   ├── i18n/                   # i18next + locales/{en,fr,ar}
│   ├── providers/              # QueryProvider, ThemeProvider
│   ├── screens/                # Screen components
│   ├── storage/                # MMKV wrapper (SSR-safe, lazy init)
│   ├── store/                  # Zustand stores (authStore, themeStore)
│   ├── types/                  # Type declarations (uniwind.d.ts)
│   ├── utils/                  # cn() utility, date utils, helpers ...
│   └── validation/             # Zod schemas (login, register, forgotPassword)
├── global.css                  # Tailwind v4 + Uniwind entry, oklch CSS vars (light/dark)
├── app.config.ts               # Expo config (EAS, plugins, fonts, localization)
├── metro.config.js             # Expo + Uniwind Metro plugin
├── babel.config.js             # module-resolver, reanimated, dotenv
├── eas.json                    # EAS Build profiles
├── eslint.config.mjs           # eslint config
├── tsconfig.json
├── package.json
└── .eas/
    └── workflows/
        └── create-build-all.yml         # Eas Actions: auto-build apk
└── .github/
    └── workflows/
        └── release.yml         # GitHub Actions: auto-release on push to main
```

## Tech Stack

| Category      | Library 
|---------------|-------------------------------
| Framework     | React 19 + React Native 0.86 
| Platform      | Expo SDK 57 
| Language      | TypeScript 6 (strict) 
| Routing       | Expo Router (Stack/Drawer/Tabs) 
| Styling       | Tailwind CSS v4 + Uniwind + cn() 
| Theme         | oklch CSS variables (light/dark + 7 accent color palettes) 
| Client State  | Zustand 5 (MMKV persistence) 
| Server State  | TanStack Query 5 + Devtools 
| Forms         | TanStack Form 1 + Zod 3 
| Storage       | react-native-mmkv 4 (lazy, SSR-safe) 
| i18n          | i18next 26 + react-i18next (EN/FR/AR, RTL) 
| UI Primitives | @rn-primitives 1.5 (Portal, Slot, Dialog, etc.) 
| Bottom Sheet  | @gorhom/bottom-sheet 5 
| Icons         | lucide-react-native 
| HTTP          | Axios (auth interceptor, refresh queue) 
| Animation     | react-native-reanimated + gesture-handler 
| Font          | @expo-google-fonts/inter (4 weights, via expo-font plugin) 
| Linting       | Eslint 
| Git hooks     | Husky
| Dates         | date-fns


## Learn More

### Documentation (Currently we don't have our own site yet but will do soon)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Uniwind Docs](https://docs.uniwind.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Form](https://tanstack.com/form/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [i18next](https://www.i18next.com/)
- [@gorhom/bottom-sheet](https://github.com/gorhom/bottom-sheet)

### Live Documentation (AI Agents)
This project uses [Context7](https://ctx7.ai) to provide AI coding agents with up-to-date documentation for all libraries and frameworks. Context7 fetches current API docs at query time instead of relying on stale training data — ensuring accurate syntax, version migrations, and configuration for React Native, Expo, Tailwind, Zustand, TanStack, and every other dependency.

### Icon Generators
- [Expo Assets Generator](https://expo-assets-generator.vercel.app/) — Generate splash, adaptive icon, favicon, and icon for Expo projects
- [BuildIcon](https://buildicon.netlify.app/) — Generate mobile app icons for iOS, Android, and web

## EAS Lifecycle

### First Release (App Store / Play Store)

```bash
# 1. Development
bun dev

# 2. Run checks before committing 
bun run checks

# 3. Push code to github
git push

# 4. login to EAS account
bun run eas:in

# 4. logout (only if u exceeded 25 free build and cant pay for pro plan)
bun run eas:out

```


### Preview / Testing / Build

```bash
# 3. Build for preview from local code (doesn't require u to push code cause on build upload from ur machine)
bun run build:prev:android
bun run build:prev:ios

# 2. Build for preview from main branch (requires u to push code to main cause on build upload from ur main github branch)
bun run flow:build-ios:main
bun run flow:build-android:main

#3. Enable Automatic EAS Builds (Recommended)
# For a fully automated CI/CD workflow, head to EAS and connect your GitHub repository to your EAS project.
# Once connected, every push to the main branch will automatically trigger the EAS workflows included in this project.
# Workflow files are located in:
# .eas/workflows/
# This allows EAS to automatically build Android and iOS apps without manually starting builds from the Expo Dashboard or CLI.

# 5. Submit to stores (skip if haven't setup google console account)
bun run submit:ios
bun run submit:android

# 4. Push OTA update (no resubmission needed)
bun run eas:update:prod
```

## Deploy

Use [Expo Application Services (EAS)](https://expo.dev/eas) for builds, updates, and submissions.

### EAS Build Profiles

| Profile       | Distribution   | Channel     | Use Case
|---------------|----------------|-------------|---------------------------
| `development` | Internal       | development | Dev client builds for local testing (Expo Go)
| `preview`     | Internal (APK) | preview     | Internal QA builds 
| `production`  | Store (AAB)    | production  | App Store / Play Store release 
| `simulator`   | —              | —           | iOS simulator / Android emulator builds 
 

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

| File                | Purpose           
|---------------------|--------------------------------------
| `.env.development`  | Local dev values  
| `.env.preview`      | Preview/QA builds 
| `.env.production`   | Production builds 
| `src/config/env.ts` | Shared constants (`EXPO_PUBLIC_SLUG`, `EXPO_PUBLIC_PACKAGE`, `EAS_PROJECT_ID`) 

- Android package: `com.rn_template.app` (underscores, not hyphens — Android requirement)
- EAS profiles inject `EXPO_PUBLIC_APP_ENV` via `eas.json` `env` block

## Planned Features (Need Contributors)
- **Consola** - for better developer command experience
- **Expo Observe** — error tracking and performance monitoring via `expo-observe`
- **Maestro + Jest** — E2E testing framework for mobile
- **Expo** [Other Expo Features](https://docs.expo.dev/versions/latest/sdk/expo/)
- **App Store Connect** — EAS Submit pipeline for App Store and Play Store release
- **Convex** — Realtime backend with reactive data sync
- **PostHog** — Product analytics for feature usage and user behavior
- **LogRocket** — Session replay and frontend performance monitoring
- **Sentry** — Crash reporting and error tracking
- **Vexo** — AI-powered in-app chatbot and customer support

## Planned Features (Expected)
- **Immersive Focus** [Hide Navigation bar](https://docs.expo.dev/versions/latest/sdk/navigation-bar/)
- **Expo Notifications** — push notifications via `expo-notifications` with local + remote notification support

