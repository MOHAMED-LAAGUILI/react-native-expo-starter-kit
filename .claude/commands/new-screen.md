---
description: Scaffold a new screen following this repo's routing, i18n and doc conventions
argument-hint: <screen-name> [tab|drawer]
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Scaffold a new screen named `$1`, registered as a **$2** route (default: drawer-only if omitted).

Read `CLAUDE.md` first, then follow every step — a screen is not done until all of them are.

1. **Screen component** — `src/screens/$1-screen.tsx`, kebab-case filename, PascalCase component. Named export (`export { FooScreen }`); add a default export too only if an existing screen in the same group does.
2. **Route file** — a one-line re-export:
   - tab: `app/(app)/(tabs)/$1.tsx`
   - drawer-only: `app/(app)/$1.tsx`
   - **Declare it** (Expo Router SDK 58 only registers declared screens — an undeclared route is unreachable): a drawer-only route goes into `DRAWER_ROUTES` in `app/(app)/_layout.tsx`; a non-tab route under `(tabs)/` needs a plain `<Tabs.Screen name="$1" />` (never `href: null`, which makes it redirect to the first tab). `__tests__/architecture/routes-declared.test.ts` fails otherwise.
3. **Navigation config** — add a `NavItem` to `BASE_NAV_ITEMS` in `src/config/navigation.ts` with `href`, `icon` (lucide), `label`, `translationKey`, `match`, `segment`. For a tab, also add `tab: { name, icon, order }` and pick an `order` that does not collide with an existing one.
4. **i18n** — add the `navigation.*` key and every user-facing string to **both** `src/i18n/locales/en/` and `src/i18n/locales/fr/`. If the screen needs its own namespace, register it in both `resources` and the `ns` array in `src/i18n/index.ts`.
5. **Styling** — Uniwind `className` + `cn()`. Theme-aware hex only via `useThemeColors()` / `usePrimaryHex()` — never capture those into `useState`/`useRef`, and never hardcode a theme color. Lucide icons take `color`, never `className`.
6. **Cross-platform** — `SafeAreaView` or `useSafeAreaInsets()`; `contentContainerStyle` (not `className`) for scroll-container backgrounds; `Image` needs `contentFit` and an explicit size style.
7. **Tests** — give the screen's main interactive elements kebab-case `testID`s (`$1-<element>`); add an `rn` test for any non-trivial component or hook it introduces, and a Maestro flow under `.maestro/` if a user walks through it (`docs/TESTING.md`, `.maestro/README.md`).
8. **Docs** — update `CLAUDE.md` (routing structure + file organization) and `README.md` if it is user-facing. Docs ship in the same change, not after.
9. Run `/checks`.
