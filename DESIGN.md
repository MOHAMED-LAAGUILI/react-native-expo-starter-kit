# Design System: React Native Starter Kit

> Single source of truth for generating new screens and components.
> Grounded in the real tokens defined in `global.css`, `src/config/color-palettes.ts`, `src/components/ui/*`.
> Read this before designing anything new, then let it drive the implementation.

## 1. Visual Theme & Atmosphere

A **balanced, daily-use application** with a clinical-but-warm neutral base and a single configurable accent. Density sits at **4–6** (comfortable tap targets, generous section rhythm, nothing cockpit-dense). Variance is **4–6** — asymmetric where it matters (floating home tab button, drawer offset, mixed dashboard grids) but never chaotic. Motion is **5–7** — spring-physics micro-interactions and staggered reveals, no cinematic choreography.

The look is **native-first**: rounded-rect surfaces, hairline borders, soft tinted shadows, no neon, no glassmorphism bloat, no skeuomorphic noise. Dark mode is a first-class variant, not an afterthought — both modes share the exact same accent hue.

Three tokens every screen obeys:
1. **Everything themeable, nothing hardcoded** — colors come from `bg-*` / `text-*` / `border-*` CSS variables (oklch), never raw hex.
2. **One accent, seven choices** — the user picks a primary color (blue default) that propagates to `primary`, `ring`, `chart-1`, and sidebar highlights instantly.
3. **Native gestures over web patterns** — spring physics via Reanimated, pan-to-dismiss sheets, tactile press states.

## 2. Color Palette & Roles

Colors are **oklch CSS variables** defined in `global.css` under `@layer theme` with `@variant light` / `@variant dark`. Utility classes reference them by name: `bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc. Never reference a hex color in a component unless a native API requires it (lucide icon `color` prop, `ActivityIndicator color`).

### Neutral scale (light / dark)

| Token | Light (oklch) | Dark (oklch) | Role |
|---|---|---|---|
| `--color-background` | `1 0 0` (white) | `0.145 0 0` (zinc-950) | Root canvas |
| `--color-foreground` | `0.145 0 0` | `0.985 0 0` | Primary text |
| `--color-card` / `-popover` | `1 0 0` | `0.205 0 0` | Elevated surfaces |
| `--color-card-foreground` / `-popover-foreground` | `0.145 0 0` | `0.985 0 0` | Text on elevated surfaces |
| `--color-secondary` / `-accent` | `0.97 0 0` (zinc-100) | `0.269 0 0` (zinc-800) | Hover/fill wells |
| `--color-muted` | `0.97 0 0` | `0.269 0 0` | Subtle fill |
| `--color-muted-foreground` | `0.556 0 0` (zinc-500) | `0.708 0 0` (zinc-400) | Secondary/tertiary text |
| `--color-border` | `0.922 0 0` | `1 0 0 / 10%` | Hairline dividers |
| `--color-input` | `0.922 0 0` | `1 0 0 / 15%` | Input outlines |
| `--color-ring` | `0.708 0 0` | `0.556 0 0` | Focus rings |

### Destructive

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-destructive` | `0.577 0.245 27.325` (red-600) | `0.704 0.191 22.216` (red-500) | Errors, destructive actions |
| `--color-destructive-foreground` | `0.985 0 0` | `0.985 0 0` | Text on destructive |

### Accent (primary) — 7 palettes

Defined in `src/config/color-palettes.ts`. Each palette sets `--color-primary`, `-foreground`, `--color-ring`, `--color-chart-1`, and sidebar tokens for BOTH light and dark via `Uniwind.updateCSSVariables`. Default = **blue**.

| Key | Seed hex | Light primary (oklch) | Dark primary (oklch) |
|---|---|---|---|
| `blue` | `#0958e9` | `0.546 0.245 262.881` | `0.707 0.165 254.624` |
| `purple` | `#a855f7` | `0.558 0.288 302.321` | `0.714 0.203 305.504` |
| `green` | `#22c55e` | `0.527 0.154 150.069` | `0.696 0.17 162.48` |
| `orange` | `#f97316` | `0.646 0.222 41.116` | `0.769 0.188 70.08` |
| `red` | `#ef4444` | `0.577 0.245 27.325` | `0.704 0.191 22.216` |
| `teal` | `#14b8a6` | `0.6 0.118 184.704` | `0.696 0.17 162.48` |
| `pink` | `#ec4899` | `0.592 0.249 0.584` | `0.735 0.19 351.442` |

**Rules:**
- One accent at a time. The user picks it; `primary-foreground` flips to near-white (`0.985 0 0`) in light mode, near-black (`0.205 0 0`) in dark mode.
- Accent appears as: primary buttons, selected states, focus rings, chart series 1, active tab tint.
- Do NOT invent new accents inline. Reuse `bg-primary`, `text-primary`, `bg-primary/10`, `border-primary`, `ring-primary`.
- Status colors (success/warning/info) stay on fixed hues: green-700, yellow-700, blue-700 — used only in `Badge` and toast variants. The 700-level shades keep white text at ≥4.5:1 (AA); the 500-level versions failed contrast on white text.

### Icon color convention

lucide icons use the `color` prop with a hex from `useThemeColors()` (`text`, `muted`, `background`, `border`, `isDark`), NEVER `className` for color — `className` colors silently fail on native.

## 3. Typography

**Typeface:** Inter via `@expo-google-fonts/inter` (4 weights: 400/500/600/700), loaded through the `expo-font` config plugin. Inter is deliberate here — a neutral, highly-legible grotesque chosen for cross-platform consistency; it keeps its premium feel through weight + tracking discipline, not novelty.

### Scale (`Text` component — `src/components/ui/text.tsx`)

| Variant | Size | Weight | Notes |
|---|---|---|---|
| `h1` | `text-4xl` (36px) | 800, `tracking-tight` | Page-level heroes, one per screen |
| `h2` | `text-3xl` (30px) | 600, `tracking-tight` | Section headers |
| `h3` | `text-2xl` (24px) | 600, `tracking-tight` | Card titles |
| `h4` | `text-xl` (20px) | 600, `tracking-tight` | Sub-card titles |
| `body` | `text-base` (16px) | 400 | Default copy |
| `bodyLarge` | `text-lg` (18px) | 400 | Lead copy |
| `bodySmall` | `text-sm` (14px) | 400 | Dense copy |
| `caption` | `text-xs` (12px) | 400 | Timestamps, hints |
| `label` | `text-sm` | 500 | Input labels, field captions |
| `blockquote` | `text-sm` italic | 400 | Pull quotes — `border-l-2 border-border pl-3` |

**Rules:**
- Hierarchy through weight and color, not just size. Never stack two `h1`/`h2` elements.
- All text defaults to `text-foreground`. Secondary/tertiary via `text-muted-foreground`.
- Use `Text` (wrapped) everywhere — never raw `react-native` `Text`.
- All user-facing strings go through `t()` from `useTranslation()` (EN/FR). No hardcoded copy.
- Numeric columns (tables, stats) should render in tabular figures where precision matters.
- Monospace is allowed only for code, tokens, and machine identifiers — no mono accent headers.

## 4. Shape, Elevation & Spacing

- **Radius scale** (`@theme`): base `--radius: 10px`; `rounded-sm` 6px, `rounded-md` 8px, `rounded-lg` 10px, `rounded-xl` 14px.
  - Buttons, inputs, list rows: `rounded-md`/`rounded-lg`.
  - Cards and surfaces: `rounded-xl`.
  - Badges/pills/avatars: `rounded-md` at small sizes, full capsule only for dots and handles.
- **Elevation:** tinted shadows for emphasis. Primary/success/destructive buttons carry a soft colored shadow (`elevation: 6`, `shadowOpacity: 0.4`, 12px radius, 4px offset) in the accent hue. Cards rely on surface color + hairline borders instead of heavy drop shadows.
- **Spacing:** 4px base grid via Tailwind. Prefer `gap-*` over margins; prefer padding over margin. Section rhythm: `px-4` page gutters, `py-4`/`py-6` between groups, `gap-4`/`gap-6` between cards.
- **Hairlines:** `border-border` dividers (1px) separate rows and groups — never use two competing border colors in one view.
- **Touch targets:** minimum 44px hit area (h-9→36px is acceptable for dense secondary rows; primary actions ≥ h-11).

## 5. Component Behaviors

### Button (`button.tsx`)
7 variants: `primary`, `primary-gradient` (LinearGradient accent), `secondary` (`bg-primary/10`), `outline` (accent border + transparent fill), `ghost`, `destructive`, `success`. 3 sizes: `sm` h-9 / `md` h-11 / `lg` h-12. Icon slots: `leftIcon`/`rightIcon` (render-prop) or `leftIconComponent`/`rightIconComponent` (lucide). `loading` swaps content for a spinner. Pressed → `opacity-80`, disabled → `opacity-50`. Text is always `font-semibold`.

### Badge (`badge.tsx`)
8 variants (`default`, `primary`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`), 3 sizes (`sm`/`md`/`lg`), optional lucide `icon`. Default = neutral `bg-muted-foreground/15`. Semantic variants use their fixed hues. Self-start, `rounded-md`, `font-semibold` label.

### Input (`input.tsx`)
Label above, input well (`h-11`, `rounded-md`, `bg-secondary`, `border-border`), helper/error below in `text-destructive`. Focus → `border-ring`. Built-in types: `email`, `password` (eye toggle), `phone`, `search`, `username`, `text` — each with a contextual lucide icon. Error state: `border-destructive` + inline caption. Placeholder color `#9CA3AF` in both modes.

### BottomSheet (`bottom-sheet.tsx`)
`@gorhom/bottom-sheet` with `enablePanDownToClose`, backdrop `opacity: 0.5` fading out at `-1`, sticky handle in `border` color, header with title + `X` close button (`size-8`, `rounded-full`, `bg-muted`). Options render as rows with `border-b border-border`, selected row = `bg-primary/10` + `font-semibold text-primary` + 2px `bg-primary` dot. Snap points default `['40%', '100%']`.

### Modal (`modal.tsx`)
3 variants: `bottom-sheet` (slides up), `centered` (scale-in with icon/title/description), `centered-action` (+ action buttons). Backdrop fade 220ms (`withTiming`); sheet spring `{ damping: 20, stiffness: 260 }`, centered scale `{ stiffness: 300 }`. Actions use Button variants. Always provide explicit `onClose`.

### Card (`card.tsx`)
Data card with 5 variants: `stats` (default — `bg-card` + hairline `border-border`), `primary` (solid accent fill, white text), `secondary`, `compact` (tighter padding, `text-2xl` value), `action`. Props: `title`, `value`, `subtitle`, optional lucide `icon` (44×44 tinted well), `children`. Surface: `rounded-2xl`, `border`, `overflow-hidden`.

### Form controls
- **Switch / Toggle / Checkbox / RadioGroup / Slider / Progress** — all tinted with primary accent.
- **CalendarView** (`react-native-calendars`) for date selection with marked dates; **DateTimePickerField** (`@react-native-community/datetimepicker`) for native pickers.
- **Spinner** — `ActivityIndicator` via native `color` prop (hex from `useThemeColors`), sizes `sm`/`md`/`lg`.
- **Image** — `expo-image` wrapper; ALWAYS pass `contentFit` + `style={{ height: '100%', width: '100%' }}` or it renders blank on native.

### Feedback & states
- **Loading:** skeleton/`Spinner` matching layout dimensions. Spinner color must come from theme, not default.
- **Empty states:** composed (icon + title + body + optional action), never bare "No data".
- **Errors:** inline `text-destructive` captions under fields; toasts via `showToast({ variant: 'success'|'error'|'info', title, message })`.
- **Toasts** (`react-native-toast-message-ts`): success → green, error → destructive red, info → accent/neutral. Mounted once in root layout.

### shadcn/RNR components (`src/components/ui/`)
Unofficial-but-native shadcn/ui components (React Native Reusables, **Uniwind** flavor) co-located in the `ui/` kit. Bound to the same CSS variables — `bg-card`, `border-border`, `text-card-foreground`, `bg-muted`, `bg-secondary` — so light/dark and all 7 accent palettes apply automatically. Zero theme changes required.

| Component | Usage notes |
|---|---|
| `Text` / `TextClassContext` | Custom variant scale (`h1`–`h4`, `body`, `bodyLarge`, `bodySmall`, `caption`, `label`, `blockquote`) — see §3. `TextClassContext` lets consumers override text styling (used by `Alert`). |
| `Card` | Custom data-card — see "Card" above; not a shadcn surface kit. |
| `Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent` | Collapsible sections on `@rn-primitives/accordion`. |
| `Alert` / `AlertTitle` / `AlertDescription` | Callout with `role="alert"` + lucide icon; `variant="destructive"` tints title/description. |
| `Menubar` + `MenubarTrigger`/`MenubarContent`/`MenubarItem`/… | Menu bar on `@rn-primitives/menubar` + `@rn-primitives/portal`. |
| `Popover` / `PopoverTrigger` / `PopoverContent` | Floating popups on `@rn-primitives/popover`. |
| `Select` + `SelectTrigger`/`SelectValue`/`SelectItem`/… | Native-styled picker on `@rn-primitives/select`. |
| `Separator` | Hairline divider on `@rn-primitives/separator`. |
| `Skeleton` | Custom Reanimated opacity pulse (1000ms repeat, 1→0.5) on `bg-secondary dark:bg-muted rounded-md`. |
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Tab switch on `@rn-primitives/tabs`. |
| `Tooltip` / `TooltipTrigger` / `TooltipContent` | Hover/press hints on `@rn-primitives/tooltip`. |

**Rules:**
- Import from `@/components/ui` barrel; keep a component's `Text`/`TextClassContext` tree within the consuming component.
- Add more anytime: `pnpm dlx shadcn@latest add @rnr/<component>` (registry wired in `components.json` → `https://reactnativereusables.com/r/uniwind/{name}.json`).
- Do NOT override a component that already exists in `src/components/ui/` (Button, Input, Badge, Switch, Modal, Card, BottomSheet, etc.) — use the custom kit for those; the RNR components above are already wrapped for this kit, so add new ones via the registry rather than hand-rolling.

## 6. Layout & Navigation

- **Safe areas:** every screen in `SafeAreaView` or using `useSafeAreaInsets()` (native only; web ignores). Root already wraps in `GestureHandlerRootView` + `SafeAreaProvider`.
- **Page structure:** `ScrollView` with `contentContainerStyle` for padding/gap (never className for scroll-container backgrounds); first child almost always the ScrollView. Lists use `FlatList`/`SectionList` with `contentInsetAdjustmentBehavior="automatic"`.
- **Navigation shell:**
  - Root `Stack` → `(auth)` login stack (no header) → `(app)` **Drawer** (auth-guarded) → `(tabs)` **Bottom Tabs**.
  - Tabs: Search, Report, Home (floating center button), Settings, Device Info — sorted by `tab.order` in `src/config/navigation.ts`. Home is the floating elevated center button.
  - Drawer-only routes (`report`, `dev-*`) live under `(app)/` with no tab.
  - Header titles come from `NAV_TITLE_MAP` (i18n keys), never hardcoded. Drawer toggle button sits at `ml-3` on native.
- **Cards:** used when elevation communicates hierarchy (dashboard widgets, profile rows). In dense lists, prefer `border-b border-border` rows over card-stacking.
- **Dashboards/Report:** mixed grid — trend snapshot + hours distribution + top projects (gifted-charts `BarChart`/`PieChart`, series tinted from `--color-chart-1`). Don't render 3 identical equal cards in a row; vary sizing.

## 7. Motion & Interaction

- **Spring physics** (Reanimated): interactive springs `{ damping: 20, stiffness: 260 }`; heavier pushes `stiffness: 300`. Durations via `withTiming` only for fades (220ms backdrop).
- **Gesture-driven:** sheets/scroll panning via `react-native-gesture-handler`; `Modal` uses `GestureDetector`. Reanimated worklets via `react-native-worklets` (`scheduleOnRN`).
- **Micro-interactions:** pressed states (`opacity-80`), switch/checkbox accent transitions, slider drag with spring. Enter/exit animations on demos via Reanimated springs/timing (as in `Modal`).
- **Performance rules:** animate only `transform` and `opacity`, never layout props; don't pass `Color`/`PlatformColor` into Reanimated styles (use static hex); avoid re-rendering whole screens on gesture progress.
- **Reduced motion:** respect system settings where feasible (opacity-only transitions degrade gracefully).

## 8. Cross-Platform Rules (Web + iOS + Android)

- Icons: lucide `color` prop + `useThemeColors()` hex — never `className` color.
- SVG artwork: pull colors from theme hooks / CSS variables, never hardcoded `#ffffff`.
- `Image`: always `contentFit` + explicit `style` dimensions (web-only otherwise).
- RTL: **not supported** — no RTL layouts, Arabic removed from languages.
- Text input autofill/`keyboardType` set per field (`email-address`, `phone-pad`, `number-pad`).
- Test spacing on all platforms; drawer/header items may need explicit `ml`/`mr` on native.
- Feature detection via `Platform.select`/`process.env.EXPO_OS`; dynamic `import()` for modules absent on web (e.g. `expo-dynamic-app-icon`).

## 9. Anti-Patterns (Banned)

- Hardcoded colors — no raw hex in classNames or SVGs; theme tokens only.
- `Inter` free-form usage outside the token scale — no arbitrary sizes/weights; use `Text` variants.
- Purple/blue neon gradients, outer glows, or oversaturated dual-accent schemes.
- Pure black `#000000` as a design color — use `background` (light: white, dark: zinc-950).
- Raw `Text`/`Pressable` from `react-native` in UI — always the wrapped versions.
- Hardcoded user-facing copy — always `t()` (EN/FR).
- 3 identical equal cards in a row; centered-hero-only layouts on dashboards.
- Emojis in UI; generic placeholder names (`John Doe`, `Acme`); AI copywriting clichés (`Elevate`, `Seamless`, `Next-Gen`).
- Fake-perfect metrics (`99.99%`); invented percentages with no data source.
- Bouncing scroll arrows / "scroll to explore" filler.
- Modal-ception — never stack two modal variants; prefer a route presentation or single sheet.
- Layout animations on `top`/`left`/`width`/`height` — transforms and opacity only.
- Removing a screen without updating `src/i18n/locales/{en,fr}/` keys.

## 10. Design Tokens Cheat-Sheet (for AI agents)

When generating a screen, default to:
- Canvas: `bg-background`; sections: `bg-card`; wells: `bg-secondary` or `bg-muted`.
- Text: `text-foreground` body, `text-muted-foreground` secondary.
- Dividers: `border-t border-border`.
- Primary action: `<Button title={t('...')} />` (accent). Secondary: `<Button variant="secondary" />`.
- Inputs: `<Input label={...} />`; selection: `<RadioGroup/>`, `<Checkbox/>`, `<Switch/>`, or `<BottomSheet options={...} />`.
- Feedback: `<Spinner/>`, inline `text-destructive` errors, `<Toast/>` for transient alerts.
- Radius: cards `rounded-xl`, controls `rounded-md`, buttons `rounded-lg`.
- Rhythm: `px-4` gutters, `gap-4`, `py-4`.
- Icons: lucide + `color` from `useThemeColors()`.
- All copy: `t()` EN/FR. All colors: theme variables. All screens: safe-area aware.
- RNR structure & overlays: `Tabs`, `Accordion`, `Menubar`, `Popover`, `Select`, `Tooltip`, `Separator`, `Alert`, `Skeleton` from `@/components/ui` — same theme tokens. `Card` is the custom data-card (variants `primary`/`secondary`/`stats`/`compact`/`action`).

**Themes that must stay in sync when you change any token:**
1. `global.css` — neutral + radius + spacing tokens.
2. `src/config/color-palettes.ts` — accent palettes (light + dark).
3. `src/store/theme-store.ts` — mode (`light`/`dark`/`system`) + selected accent, persisted in MMKV.
4. `src/providers/theme-provider.tsx` — `Uniwind.setTheme` + `updateCSSVariables` + navigation theme.
