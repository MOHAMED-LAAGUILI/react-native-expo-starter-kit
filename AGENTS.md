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
| `bun run clean` | `rm -rf .expo node_modules` |
| `bun run fix:deps` | `npx expo install --fix` |
| `bun run doctor` | `npx expo-doctor --verbose` |
| `bun run prebuild` | `expo prebuild --clean` |
| `bun run biome` | `npx @biomejs/biome check --write && npx @biomejs/biome format --write` |
| `bun run format` | `npx @biomejs/biome format --write` |

## Conventions

### Naming
- **Files**: kebab-case (`src/screens/login-screen.tsx`, `components/ui/button.tsx`)
- **Routes**: Expo Router (`_layout.tsx`, `settings.tsx`, `app/(auth)/login.tsx`)
- **Components**: PascalCase (`Button`, `BottomSheet`, `LoadingScreen`)
- **Functions/vars**: camelCase (`setMode`, `changeLanguage`, `hydrate`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`, `THEME_OPTIONS`)
- **Store slices**: camelCase with `Store` suffix (`useAuthStore`, `useThemeStore`)

### Exports
- **Page components**: default export (`export default function Screen`)
- **Reusable components**: named export (`export { Button, BottomSheet }`)
- **Utilities**: named export (`export function cn`)
- **Stores**: named export (`export { useAuthStore }`)
- **Types**: `export type { ... }`

### UI Components
- Use custom components from `@/components/ui/` (`Text`, `Button`, `Input`, `BottomSheet`) instead of `Text` and `Pressable` from `react-native`
- Custom components support `variant`, `className`, and proper theme tokens — never use raw `react-native` components for UI

### Imports
- `@/` path alias maps to `./src/` (tsconfig paths)
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
| Lint | Biome 2 |

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
├── screens/          — LoginScreen, HomeScreen, SearchScreen, ProfileScreen, SettingsScreen
├── storage/          — MMKV wrapper (lazy, SSR-safe, try/catch fallback)
├── store/            — Zustand stores (authStore, themeStore) with MMKV persist
├── types/            — Global type declarations (uniwind.d.ts)
├── lib/              — cn() utility, form-helpers (getFieldError)
├── utils/            — format utilities, platform helpers
├── validation/       — Zod schemas (login, register, forgotPassword)
global.css            — Tailwind v4 entry + CSS vars (oklch light/dark, @variant)
```

## State Management
- **Zustand**: Auth tokens/user, theme mode. Persisted via MMKV middleware. Hydrated on app boot via `hydrate()` call (not module-level).
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
- 3 languages: English, French, Arabic
- Namespaces: `common`, `auth`
- RTL support (Arabic toggles `I18nManager.forceRTL` + `RNRestart.restart()` with `Updates.reloadAsync()` fallback)
- Language persisted in MMKV via `StorageService`
- `changeLanguage(lang)` updates i18next + triggers restart if RTL changed

## Auth Flow
1. App boots → `SplashScreen.preventAutoHideAsync()`
2. `RootLayout` → setup i18n → `setupI18n()`
3. `RootLayoutInner` → hydrate auth + theme stores from MMKV
4. When i18n ready + stores hydrated → `SplashScreen.hideAsync()`
5. Auth guard in `(app)/_layout.tsx` → redirects to `/(auth)/login` if not authenticated
6. LoginScreen → `authStore.login()` (demo mode: sets mock token)
7. After login → router replaces to `/(app)/(tabs)`
8. Tokens stored in MMKV, attached via Axios interceptor, refresh queue for 401s

## Navigation Patterns
- **Left Drawer**: single `(tabs)` route group, accessible via `DrawerToggleButton` in header (top-left hamburger)
- **Bottom Tabs**: Home, Search, Profile, Settings with lucide icons
- **Auth guard**: redirect logic in `(app)/_layout.tsx` (check `isAuthenticated`, replace to login if false)
- **Header**: custom `headerLeft` with `DrawerToggleButton` positioned via `ml-3`

## Component Patterns
- All UI components use `className` + `cn()` for styling with Tailwind classes
- `BottomSheet<T>` — generic bottom sheet built on `@gorhom/bottom-sheet` v5 with `enablePanDownToClose`, backdrop, `index` prop (`-1` closed, `0` open), sticky handle
- `Badge` — variants (default/primary/secondary/destructive/outline), sizes (sm/md/lg)
- `Text` — variants (h1-h4, body/large/small, caption, label)
- `Input` — styled input with label, error, icon support
- `Switch` — toggle switch with primary color theming
- `Checkbox` — checkbox with checkmark icon
- `RadioGroup` / `RadioGroupItem` — radio button group
- `Slider` — gesture-driven slider with reanimated
- `Spinner` — ActivityIndicator with size variants (sm/md/lg)
- `Image` — expo-image wrapper with fallback
- `Progress` — progress bar with primary color fill
- `Toggle` — pressed-state toggle button (on/off)

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
- `axios` — HTTP client with interceptors
- `expo-haptics` — haptic feedback
- `expo-splash-screen` — splash screen lifecycle
- `expo-system-ui` — system background color sync
- `expo-status-bar` — status bar component
- `react-native-safe-area-context` — SafeAreaProvider + useSafeAreaInsets
- `react-native-url-polyfill` — URL polyfill for fetch
- `react-native-restart` — app restart on RTL language change
- `react-native-edge-to-edge` — edge-to-edge display
- `react-native-reanimated` + `react-native-gesture-handler` — animations + gestures

## Notes
- No test framework installed
- `expo-env.d.ts` and `.expo/types/` are auto-generated — do not edit
- `src/types/uniwind.d.ts` patches TypeScript 6 compatibility with uniwind types
- `app.config.ts` inlines all env values (no separate env.ts loaded during config resolution to avoid Node ESM `.ts` issues)
- Use `bun` for package management only — don't add `package-lock.json` or `yarn.lock`
- MMKV storage is lazily initialized with try/catch to prevent SSR crashes during Metro bundling
- `ActivityIndicator` in Uniwind doesn't support `className` color — use native `color` prop with hex fallback
