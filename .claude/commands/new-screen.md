---
description: Scaffold a new screen following this repo's routing, i18n and doc conventions
argument-hint: <screen-name> [tab|drawer]
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Scaffold a new screen named `$1`, registered as a **$2** route (default: drawer-only if omitted).

Read `AGENTS.md` first, then follow every step — a screen is not done until all of them are.

1. **Screen component** — `src/screens/$1-screen.tsx`, kebab-case filename, PascalCase component. Named export (`export { FooScreen }`); add a default export too only if an existing screen in the same group does.
2. **Route file** — a one-line re-export:
   - tab: `app/(app)/(tabs)/$1.tsx`
   - drawer-only: `app/(app)/$1.tsx`
3. **Navigation config** — add a `NavItem` to `BASE_NAV_ITEMS` in `src/config/navigation.ts` with `href`, `icon` (lucide), `label`, `translationKey`, `match`, `segment`. For a tab, also add `tab: { name, icon, order }` and pick an `order` that does not collide with an existing one.
4. **i18n** — add the `navigation.*` key and every user-facing string to **both** `src/i18n/locales/en/` and `src/i18n/locales/fr/`. If the screen needs its own namespace, register it in both `resources` and the `ns` array in `src/i18n/index.ts`.
5. **Styling** — Uniwind `className` + `cn()`. Theme-aware hex only via `useThemeColors()` / `usePrimaryHex()` — never capture those into `useState`/`useRef`, and never hardcode a theme color. Lucide icons take `color`, never `className`.
6. **Cross-platform** — `SafeAreaView` or `useSafeAreaInsets()`; `contentContainerStyle` (not `className`) for scroll-container backgrounds; `Image` needs `contentFit` and an explicit size style.
7. **Docs** — update `AGENTS.md` (routing structure + file organization) and `README.md` if it is user-facing. Docs ship in the same change, not after.
8. Run `/checks`.
