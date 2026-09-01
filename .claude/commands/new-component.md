---
description: Scaffold a new UI component following this repo's component and design conventions
argument-hint: <component-name>
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Create a new component named `$1`.

Before writing anything, read `DESIGN.md` for the component contract and find the closest existing component in `src/components/ui/` to match its shape, prop naming, and variant style.

1. **File** — `src/components/ui/$1.tsx` (kebab-case). Reusable components use **named** exports.
2. **Barrel** — re-export from `src/components/ui/index.ts` so consumers import from `@/components/ui`.
3. **Styling** — `className` + `cn()` for merging. Variants follow the existing `variant` / `size` prop pattern. Use design tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) — never hardcoded hex for themed surfaces.
4. **Theme-aware hex** — for lucide `color`, SVG fills, and `ActivityIndicator`, read live from `useThemeColors()` / `usePrimaryHex()` on every render.
5. **Motion** — use the presets in `@/config/motion` (`SPRING_PRESS`, `SPRING_GENTLE`). No inline `{ damping, stiffness, mass }` literals.
6. **Types** — `type` over `interface`; inline `import { type Foo }`. Wrapper props via `React.ComponentProps<typeof X>` + `React.RefAttributes`.
7. **Limits** — functions cap at 110 lines and 3 params; extract sub-components or use an options object rather than raising either.
8. **Docs** — add the component to `DESIGN.md` (props, variants, sizes, motion) and to the component list in `AGENTS.md`, in this same change.
9. Run `/checks`.
