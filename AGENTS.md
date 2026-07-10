# AGENTS.md — React Native Starter Kit

## Project Overview
Production-ready Expo + React Native starter with file-based routing, Tailwind v4 (Uniwind), Zustand, TanStack Query, i18n, auth, Drawer + Tabs navigation, and @gorhom/bottom-sheet.

## Commands
| Script | Command |
|--------|---------|
| `bun dev` | `expo start -c` |
| `bun run android` | `expo start -c --android` |
| `bun run ios` | `expo start -c --ios` |
| `bun run web` | `expo start -c --web` |
| `bun run clean` | `rm -rf .expo node_modules android ios build dist bun.lock && bun install` |
| `bun run deps:fix` | `npx expo install --fix` |
| `bun run doctor` | `npx expo-doctor --verbose` |
| `bun run prebuild` | `expo prebuild -c` |
| `bun run lint:fix` | `npx eslint src/ --fix && npx eslint app/ --fix` |
| `bun run export` | `npx expo export --platform web` |
| `bun run login` | `eas login` |
| `bun run logout` | `eas logout` |
| `bun run start:preview` | `cross-env EXPO_PUBLIC_APP_ENV=preview expo start -c` |
| `bun run start:production` | `cross-env EXPO_PUBLIC_APP_ENV=production expo start -c` |
| `bun run prebuild:preview` | `cross-env EXPO_PUBLIC_APP_ENV=preview expo prebuild -c` |
| `bun run prebuild:production` | `cross-env EXPO_PUBLIC_APP_ENV=production expo prebuild -c` |

### EAS Build Profiles
| Profile | Distribution | Channel | Use Case |
|---------|-------------|---------|----------|
| `development` | Internal | — | Dev client builds for testing |
| `preview` | Store (APK) | preview | Internal testing / QA |
| `production` | Store (AAB) | production | App Store / Play Store release |
| `simulator` | — | — | iOS simulator / Android emulator builds |

## Essentials

How: Essential Rules

### Imports & Modules
- ✅ DO use absolute imports: `@/components/ui/button`, `@assets/images/icon.png`
- ✅ DO use `color` prop on lucide icons, never `className` (`color={text}`, `color={muted}`)
- ✅ DO use `cn()` for className merging (`cn('flex-1', focused && 'bg-primary/10')`)
- ✅ DO use dynamic `import()` for native modules that may be absent on web (`import('expo-dynamic-app-icon')`)
- ✅ DO use `Linking.openURL` with plain string URLs for deep links
- ✅ DO use inline type imports — `import { type Foo }` not `import { Foo }` (`ts/consistent-type-imports`)
- ✅ DO use `type` over `interface` for type definitions (`ts/consistent-type-definitions`)
- ❌ DO NOT nest component definitions inside other components (`react/no-nested-component-definitions`)
- ❌ DO NOT use `cloneElement` — use render prop pattern instead (`react/no-clone-element`)

### State & Data
- ✅ DO use Zustand for client state with MMKV persistence
- ✅ DO use TanStack Query for server state with staleTime 5min
- ✅ DO use arrow selectors for perf: `useAuthStore((s) => s.isAuthenticated)`
- ✅ DO use TanStack Form + Zod for form validation (not react-hook-form)
- ✅ DO use MMKV storage for sensitive/persisted data (not AsyncStorage)
- ❌ DO NOT set state synchronously in `useEffect` — use lazy initializer: `useState(() => readAllKeys())`

### UI & Styling
- ✅ DO use custom components from `@/components/ui/` (`Text`, `Button`, `Input`, `BottomSheet`)
- ✅ DO use `useThemeColors()` for dynamic colors in icons and SVG
- ✅ DO use `t()` from `useTranslation()` for all user-facing strings (never hardcode)
- ✅ DO use kebab-case for filenames (`unicorn/filename-case`)
- ✅ DO extract components when a function exceeds 110 lines (`max-lines-per-function`)
- ✅ DO cap function params at 3; use options object beyond that (`max-params`)
- ✅ DO write React Compiler–compatible code (`react-compiler/react-compiler`)
- ❌ DO NOT use raw `Text`/`Pressable` from `react-native` — use wrapped versions
- ❌ DO NOT modify `android/` or `ios/` directly — use Expo config plugins

### Build & Config
- ✅ DO set `process.env.EXPO_ROUTER_APP_ROOT = './app'` and `EXPO_ROUTER_IMPORT_MODE = 'sync'` at the top of `metro.config.js`
- ✅ DO use `bun` for package management (no `package-lock.json` or `yarn.lock`)
- ❌ DO NOT edit `expo-env.d.ts` or `.expo/types/` — they are auto-generated

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
- **Components**: PascalCase (`Button`, `BottomSheet`, `LoadingScreen`)
- **Functions/vars**: camelCase (`setMode`, `changeLanguage`, `hydrate`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`, `THEME_OPTIONS`)
- **Store slices**: camelCase with `Store` suffix (`useAuthStore`, `useThemeStore`)
- **Assets**: lowercase a-z, numbers 0-9, underscores only (`loading_animation_blue.json`, `expo_icon_dark.png`)

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
- **Lottie**: wrap in sized container (`width`/`height` via `style`); no dimensions = large default
- **Spacing**: test on all platforms — drawer/header items may need explicit `ml`/`mr` margins on native that web handles via CSS
- **SafeArea**: always wrap screens in `SafeAreaView` or use `useSafeAreaInsets()` — not needed on web but critical on native
- **Drawer/Header**: `DrawerToggleButton` and header buttons need explicit margins (`ml-3`, `mr-3`) on native
- **ScrollViews**: use `contentContainerStyle` not `className` for background colors on scroll containers
- **SVG**: hardcoded hex colors (`#ffffff`) won't follow theme — use `useThemeColors()` or CSS variables for dynamic theming
- **BottomSheet**: `@gorhom/bottom-sheet` needs `GestureHandlerRootView` wrapper — already in root layout
- **RTL**: not supported — Arabic removed from language options

### Imports
- `@/` path alias maps to `./src/` (tsconfig paths)
- `@assets/*` path alias maps to `./assets/*` (tsconfig + Metro resolver)
- Absolute imports: `import { cn } from '@/lib/utils'`
- Side-effect CSS: `import '@/global.css'`
- URL polyfill (entry): `import 'react-native-url-polyfill/auto'`
- Store selectors for perf: `useAuthStore((s) => s.isAuthenticated)`

### TypeScript
- Strict mode, TSX for components, `.ts` for utilities
- Prefer inline types over redundant interfaces for simple objects
- `React.ComponentProps<typeof Component>` + `React.RefAttributes` for wrapper props

## Tech Stack
| Layer | Library |
|-------|---------|
| Framework | React 19 + React Native 0.86 |
| Platform | Expo SDK 57 |
| Language | TypeScript 6 (strict) |
| Routing | Expo Router (Stack/Drawer/Tabs) |
| Styling | Tailwind v4 + Uniwind + `cn()` (clsx + tailwind-merge) |
| Theme | CSS variables in oklch (light/dark + 7 accent color palettes) |
| Client State | Zustand 5 (MMKV persistence, lazy hydration) |
| Server State | TanStack Query 5 + Devtools |
| Networking | Axios (auth interceptor, refresh queue) |
| Forms | TanStack Form 1 + Zod 3 |
| Storage | react-native-mmkv 4 (lazy init, SSR-safe) |
| i18n | i18next 26 + react-i18next (EN/FR/AR, RTL via RNRestart) |
| UI Primitives | @rn-primitives 1.5 (Portal, Dialog, Slot, etc.) |
| Bottom Sheet | @gorhom/bottom-sheet 5 |
| Icons | lucide-react-native |
| Animation | react-native-reanimated + gesture-handler |
| Font | @expo-google-fonts/inter (4 weights via expo-font plugin) |
| Lint | ESLint 10 + Prettier 3 |
| Assets Alias | `@assets/*` → `./assets/*` (tsconfig + Metro) |

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
    ├── _layout.tsx      — Drawer (left hamburger via DrawerToggleButton) + auth guard
    ├── features.tsx     — Features list (drawer-only, no bottom tab)
    ├── blank.tsx        — Blank page (drawer-only, no bottom tab)
    └── (tabs)/
        ├── _layout.tsx  — Tabs (Home, Search, Profile, Settings) with lucide icons
        ├── index.tsx    — Home tab
        ├── search.tsx   — Search tab
        ├── profile.tsx  — Profile tab
        └── settings.tsx — Settings tab (theme/lang bottom-sheets, app info)
```

## File Organization
```
src/
├── api/              — Axios client, typed hooks (useLogin, usePosts, etc.)
├── components/
│   ├── common/       — LoadingScreen, ErrorFallback, SettingRow, InfoRow, PostCard
│   ├── drawer/       — DrawerHeaderLeft, DrawerHeaderRight, DrawerProfileHeader, HeaderTitle, AppDrawerContent
│   └── ui/           — Button, Text, Input, BottomSheet, Badge, Switch, Checkbox, RadioGroup, Slider, Spinner, Image, Progress, Toggle
├── config/           — Constants, env helpers, color-palettes.ts (7 palettes)
├── hooks/            — Shared hooks
├── i18n/             — i18next setup + locales/{en,fr,ar}/, RNRestart restart
├── providers/        — QueryProvider, ThemeProvider (Uniwind.setTheme + nav theme)
├── screens/          — LoginScreen, HomeScreen, SearchScreen, ProfileScreen, SettingsScreen, OnboardingScreen, FeaturesScreen
├── storage/          — MMKV wrapper (lazy, SSR-safe, try/catch fallback)
├── store/            — Zustand stores (authStore, themeStore, onboardingStore) with MMKV persist
├── types/            — Global type declarations (uniwind.d.ts)
├── lib/              — cn() utility, form-helpers (getFieldError)
├── utils/            — format utilities, platform helpers
├── validation/       — Zod schemas (login, register, forgotPassword)
global.css            — Tailwind v4 entry + CSS vars (oklch light/dark, @variant)
```

## State Management
- **Zustand**: Auth tokens/user, theme mode, onboarding state. Persisted via MMKV. Hydrated on app boot via `hydrate()` call (not module-level).
- **TanStack Query**: Server data with staleTime 5min, gcTime 30min, retry 2.
- **Selectors**: Use arrow selectors for re-render perf: `useAuthStore((s) => s.isAuthenticated)`

## Theme System
- CSS variables in `global.css` (oklch colors, `@variant light` / `@variant dark`)
- `ThemeProvider` syncs Zustand `themeStore.mode` → `Uniwind.setTheme()` + React Navigation theme
- Modes: `light`, `dark`, `system` (follows `Appearance`)
- **Accent Colors**: 7 palettes (blue, purple, green, orange, red, teal, pink) defined in `src/config/color-palettes.ts`; `themeStore.primaryColor` persisted in MMKV
- `ThemeProvider` calls `Uniwind.updateCSSVariables(theme, vars)` on boot + palette change to inject palette-specific CSS vars
- All screens use CSS variables (`bg-primary`, `text-primary`, `bg-primary/10`, etc.) instead of hardcoded colors — changing accent color propagates instantly
- Persisted in MMKV via Zustand middleware
- `expo-system-ui` background color synced on theme change

## i18n
- 2 languages: English, French
- Namespaces: `common`, `auth`
- Language persisted in MMKV via `StorageService`
- `changeLanguage(lang)` updates i18next + persists to MMKV

## Auth Flow
1. App boots → `SplashScreen.preventAutoHideAsync()`
2. `RootLayout` → setup i18n → `setupI18n()`
3. `RootLayoutInner` → hydrate auth + theme + onboarding stores from MMKV
4. When i18n ready + stores hydrated → `SplashScreen.hideAsync()`
5. Auth guard in `(app)/_layout.tsx` → redirects to `/(auth)/login` if not authenticated
6. LoginScreen → `authStore.login()` (demo mode: sets mock token)
7. After login → router replaces to `/(app)/(tabs)`
8. Tokens stored in MMKV, attached via Axios interceptor, refresh queue for 401s

## Navigation Patterns
- **Left Drawer**: single `(tabs)` route group, accessible via `DrawerToggleButton` in header (top-left hamburger)
- **Drawer-only routes**: Features, Blank — registered under `(app)/` (not inside `(tabs)`), no bottom tab
- **Bottom Tabs**: Home, Search, Profile, Settings with lucide icons
- **Auth guard**: redirect logic in `(app)/_layout.tsx` (check `isAuthenticated`, replace to login if false)
- **Header**: custom `headerLeft` with `DrawerToggleButton` positioned via `ml-3`

## Component Patterns
- All UI components use `className` + `cn()` for styling with Tailwind classes
- `BottomSheet<T>` — generic bottom sheet built on `@gorhom/bottom-sheet` v5 with `enablePanDownToClose`, backdrop, `index` prop (`-1` closed, `0` open), sticky handle
- `Badge` — variants (default/primary/secondary/destructive/outline), sizes (sm/md/lg)
- `Text` — variants (h1-h4, body/large/small, caption, label)
- `Input` — styled input with label, error, icon support; built-in `type` prop: `search`, `phone`, `username`, `password` (with Eye toggle), `email`
- `Switch` — toggle switch with primary color theming
- `Checkbox` — checkbox with checkmark icon
- `RadioGroup` / `RadioGroupItem` — radio button group
- `Slider` — gesture-driven slider with reanimated
- `Spinner` — ActivityIndicator with size variants (sm/md/lg)
- `Image` — expo-image wrapper with fallback
- `Progress` — progress bar with primary color fill
- `Toggle` — pressed-state toggle button (on/off)
- `Toast` — wrapper around `@backpackapp-io/react-native-toast` with `showToast({ variant, title, message })`, variants: `success`/`error`/`info`. Mounted in root layout, callable from anywhere.

## Important Packages
- `@gorhom/bottom-sheet` (v5) — native gesture-driven bottom sheet with snap points
- `@rn-primitives/*` (v1.5) — headless UI (Portal, Dialog, Slot, etc.)
- `uniwind` (v1.10) — Tailwind v4 runtime for RN
- `@tanstack/react-query` (v5) — server state + devtools
- `@tanstack/react-form` (v1) + `zod` (v3) — form validation
- `zustand` (v5) — client state with MMKV persist middleware
- `react-native-mmkv` (v4) — fast KV storage (lazy, SSR-safe)
- `i18next` (v26) + `react-i18next` — i18n
- `lucide-react-native` — icons
- `lottie-react-native` — Lottie animations (onboarding, loading)
- `axios` — HTTP client with interceptors
- `expo-haptics` — haptic feedback
- `expo-splash-screen` — splash screen lifecycle
- `expo-system-ui` — system background color sync
- `expo-status-bar` — status bar component
- `react-native-safe-area-context` — SafeAreaProvider + useSafeAreaInsets
- `react-native-url-polyfill` — URL polyfill for fetch
- `react-native-restart-newarch` — app restart on RTL language change
- `react-native-edge-to-edge` — edge-to-edge display
- `react-native-reanimated` + `react-native-gesture-handler` — animations + gestures

## Notes
- No test framework installed
- `expo-env.d.ts` and `.expo/types/` are auto-generated — do not edit
- `src/types/uniwind.d.ts` patches TypeScript 6 compatibility with uniwind types
- `app.config.ts` inlines all env values (no separate env.js loaded during config resolution to avoid Node ESM `.ts` issues)
- Use `bun` for package management only — don't add `package-lock.json` or `yarn.lock`
- MMKV storage is lazily initialized with try/catch to prevent SSR crashes during Metro bundling
- `ActivityIndicator` in Uniwind doesn't support `className` color — use native `color` prop with hex fallback

## CI/CD

### EAS Build (`eas.json`)
| Profile | Channel | Distribution | Use Case |
|---------|---------|-------------|----------|
| `development` | — | Internal | Dev client builds for local testing |
| `preview` | preview | Store (APK) | Internal QA builds |
| `production` | production | Store (AAB) | App Store / Play Store release |

- `autoIncrement: true` on `preview` and `production` — EAS auto-bumps build numbers
- `appVersionSource: "remote"` — version numbers managed by EAS
- Environment variables set per-profile via `env` in `eas.json`
- Build commands: `bun run build:preview:ios`, `bun run build:production:android`, etc.

### GitHub Actions Release (`.github/workflows/release.yml`)
- Triggers on **push to `main`**
- Reads version from `package.json` → tag `v{version}`
- **New version** → creates GitHub release with auto-generated notes
- **Existing version** → updates release notes with commits since previous release
- Uses `gh` CLI with `GITHUB_TOKEN` (no extra secrets needed)

### Environment Variables
- `.env.development`, `.env.preview`, `.env.production` — per-environment values
- `src/config/env.js` — shared constants (`EXPO_PUBLIC_SLUG`, `EXPO_PUBLIC_PACKAGE`, `EAS_PROJECT_ID`)
- EAS profiles inject `EXPO_PUBLIC_APP_ENV` via `eas.json` `env` block
- Android package: `com.rn_template.app` (underscores, not hyphens — Android requirement)

## Planned Features
- **Expo Observe** — error tracking and performance monitoring via `expo-observe`
- **Expo Notifications** — push notifications via `expo-notifications` with local + remote notification support
- **Husky** — git hooks for pre-commit linting and formatting
- **Maestro** — E2E testing framework for mobile
