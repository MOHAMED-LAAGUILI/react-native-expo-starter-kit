# Design System: React Native Starter Kit

> Single source of truth for generating new screens and components.
> Grounded in the real tokens defined in `global.css`, `src/config/color-palettes.ts`, `src/components/ui/*`.
> Read this before designing anything new, then let it drive the implementation.

**Where things live (current layout):**
- UI primitives + advanced components → `src/components/ui/` (barrel export from `@/components/ui`)
- Demo/section components → `src/components/demos/` (barrel from `@/components/demos`)
- Mock data → `src/data/` (`cards.ts`, `charts.ts`, `employees.ts`, `forms.tsx`, `gallery-images.ts`, `home.ts`, `onboarding-steps.ts`, `preferences-info.ts`, `report.ts`)
- Screens → `src/screens/` (thin orchestrators; sub-sections co-located in the same file)
- Routes → thin wrappers: `app/(app)/dev-*.tsx` re-exports a screen (`export { UiComponentsScreen as default } from '@/screens/...'`)

## 1. Visual Theme & Atmosphere

A **balanced, daily-use application** with a clinical-but-warm neutral base and a single configurable accent. Density sits at **4–6** (comfortable tap targets, generous section rhythm, nothing cockpit-dense). Variance is **4–6** — asymmetric where it matters (floating home tab button, drawer offset, mixed dashboard grids) but never chaotic. Motion is **5–7** — spring-physics micro-interactions and staggered reveals, no cinematic choreography.

The look is **native-first**: rounded-rect surfaces, hairline borders, soft tinted shadows, no neon, no skeuomorphic noise. Frosted glass is available as a *deliberate* surface treatment (`GlassView` + the `glass` variants on Button/Card/Badge/BottomSheet) — use it sparingly over colorful or image content where the blur reads, never as a default card background. Dark mode is a first-class variant, not an afterthought — both modes share the exact same accent hue.

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

lucide icons use the `color` prop with a hex from `useThemeColors()` (`text`, `muted`, `background`, `border`, `isDark`), NEVER `className` for color — `className` colors silently fail on native. Prefer the wrapped `Icon` component (`src/components/ui/icon.tsx`) when you need a themed, sizeable icon — it centralizes this convention.

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
  - Edge-anchored overlays (side `Sheet`, `ActionSheet`, `BottomSheet`) use a larger inner corner (`rounded-t-2xl` = 24px) where they meet the screen edge.
- **Elevation:** tinted shadows for emphasis. Primary/success/destructive buttons carry a soft colored shadow (`elevation: 6`, `shadowOpacity: 0.4`, 12px radius, 4px offset) in the accent hue. Cards rely on surface color + hairline borders instead of heavy drop shadows.
- **Spacing:** 4px base grid via Tailwind. Prefer `gap-*` over margins; prefer padding over margin. Section rhythm: `px-4` page gutters, `py-4`/`py-6` between groups, `gap-4`/`gap-6` between cards.
- **Hairlines:** `border-border` dividers (1px) separate rows and groups — never use two competing border colors in one view.
- **Touch targets:** minimum 44px hit area (h-9→36px is acceptable for dense secondary rows; primary actions ≥ h-11).

## 5. Component Behaviors

### Button (`button.tsx`)
9 variants: `primary`, `primary-gradient` (LinearGradient accent), `secondary` (`bg-primary/10`), `outline` (accent border + transparent fill), `ghost`, `destructive`, `success`, `shadcn`, `glass` (frosted `GlassView` fill, `text-foreground` label). 3 sizes: `sm` h-9 / `md` h-11 / `lg` h-12. Icon slots: `leftIcon`/`rightIcon` (render-prop) or `leftIconComponent`/`rightIconComponent` (lucide). `iconOnly` renders a square icon button (used by Table pagination). `loading` swaps content for a spinner. Pressed → `opacity-80`, disabled → `opacity-50`. Text is always `font-semibold`.

Optional `effect` prop adds press micro-interactions: `ripple` (Material ink ripple from tap point), `gooey` (squishy spring deformation), or `both`. Gooey stretches the button shell (`scaleX` 1→1.06→1, `scaleY` 1→0.96→1) while the inner content counter-scales to 0.97; when `gooey`/`both` is set, the static border is stripped and replaced by an animated `primaryHex` border. Spring = `SPRING_PRESS` from `src/config/motion.ts`.

### Badge (`badge.tsx`)
9 variants (`default`, `primary`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`, `glass` — subtle `GlassView` fill), 4 sizes (`xs`/`sm`/`md`/`lg`), optional lucide `icon` (sized 10/12/14/16 by badge size). Default = neutral `bg-muted-foreground/15`. Semantic variants use their fixed hues. Self-start, `shrink-0`, `rounded-md`, single-line `font-semibold` label. The `xs`/`sm` label sizes ship an explicit line-height (`text-[10px]/[14px]`, `text-[12px]/[16px]`) — an arbitrary font size with no line-height collapses the label on native — and the shell is never `overflow-hidden`, which clipped those labels away on device while web looked fine.

### Input (`input.tsx`)
Label above, input well (`h-11`, `rounded-md`, `bg-secondary`, `border-border`), helper/error below in `text-destructive`. Focus → `border-ring` (single focus state owned by `Input`, passed down to the field). Built-in types: `email`, `password` (eye toggle), `phone`, `search`, `username`, `text` — each with a contextual lucide icon. Error state: `border-destructive` + inline caption. Placeholder color = `useThemeColors().muted`. The consumer `ref` is forwarded to the underlying `TextInput`.

### BottomSheet (`bottom-sheet.tsx`)
`@gorhom/bottom-sheet` with `enablePanDownToClose`, backdrop `opacity: 0.5` fading out at `-1`, sticky handle in `border` color, header with title + `X` close button (`size-8`, `rounded-full`, `bg-muted`). Options render as rows with `border-b border-border`, selected row = `bg-primary/10` + `font-semibold text-primary` + 2px `bg-primary` dot. Snap points default `['40%', '100%']`. Optional `glass` prop swaps the solid background for a strong `GlassView` surface (`rounded-t-2xl`).

### GlassView (`glass-view.tsx`)
Cross-platform frosted glass built on `expo-blur`: native `UIVisualEffectView` on iOS, Dimezis `BlurView` on Android (`blurMethod="dimezisBlurView"`), CSS `backdrop-filter` on web. Props: `intensity` (`subtle` 25 / `medium` 50 / `strong` 80, or a raw 1–100 number), `tint` (`auto` follows theme, or `light`/`dark`), `bordered` (frosted hairline, on by default). A translucent wash overlay keeps the glass legible over low-contrast content. Round it with `rounded-*` classes; overflow is clipped. Used by the `glass` variants of Button, Card, Badge, and BottomSheet — place glass over colorful/image content, never over a plain `bg-background`.

### Modal (`modal.tsx`)
3 variants: `bottom-sheet` (slides up), `centered` (scale-in with icon/title/description), `centered-action` (+ action buttons). Backdrop fade 220ms (`withTiming`); sheet spring `{ damping: 20, stiffness: 260 }`, centered scale `{ stiffness: 300 }`. Actions use Button variants. Always provide explicit `onClose`.

### Sheet (`sheet.tsx`)
Edge-anchored side sheet (`side: 'left' | 'right'`) sliding from the screen edge. Width = `min(80% screen, 400px)`, inner edge corner radius 24px, `border-border` on the open edge. Open: 300ms `Easing.out(quad)` translate + backdrop fade to `opacity 0.3`; close: 250ms. Floating `X` close button (`size-8 rounded-full bg-background`, safe-area aware via `insets.top`). API: `Sheet` (context, `open`/`onOpenChange`/`side`) + `SheetTrigger` / `SheetContent` / `SheetHeader` / `SheetTitle` / `SheetDescription`.

### ActionSheet (`action-sheet.tsx`)
Platform-split: iOS renders the native `ActionSheetIOS` sheet; Android renders a themed custom modal sheet (`rounded-t-2xl bg-card`, 250–300ms slide, backdrop `bg-black/50`). Options carry `destructive`, `disabled`, `icon`, `centered`. Destructive options render `text-destructive`; optional haptics via `createHapticTrigger` (`selection` / `warning`). Pair with `useActionSheet()` hook for imperative `show({ title, message, options })` / `hide()`.

### Table (`table.tsx`)
Generic data table (`<Table data columns />`): search bar (`filterable`), click-to-sort headers (asc → desc → none, primary-tint chevron), horizontal scroll, pagination footer (`Page X of Y`, outline icon-only `Button`s), loading + empty messages. `TableColumn<T>` = `{ id, header, accessorKey, sortable?, filterable?, width?, minWidth?, cell?, headerCell?, align? }`. Cells are `p-4` rows on `bg-card` with `border-b border-border`; wrapped in `rounded-xl border border-border`. Rows support `onRowPress`.

### Charts (`chart.tsx`, `chart-container.tsx`, `chart-grid.tsx`, `chart-radial.tsx`, `chart-scatter.tsx`, `chart-skeleton.tsx`)
Three families, all theme-bound. Axis/grid/track colors come from `getAxisColor` / `getTrackColor` in `@/utils/chart` (keyed off `useThemeColors().isDark`); series colors always come from the data (`item.color`), never from the component.

- **gifted-charts wrappers (`chart.tsx`)** — `ChartPie` (donut + center label, tooltips, `ChartLegend` with % readout), `ChartBars` (`variant: 'bar-vertical' | 'bar-horizontal'`, needs an explicit `width`), `ChartColumn` (value label above each bar), `ChartLine` (`area` fills under the line, `curved` smooths it), `ChartArea` (`ChartLine` pre-set to filled + curved), `ChartStacked` (`stackData` bars), `ChartStackedArea` (up to 3 cumulative bands through `data`/`data2`/`data3`), `ChartCandlestick`. Animations run `CHART_ANIMATION_MS` (350ms) — gifted-charts animates on the JS thread, so keep them short.
- **Hand-rolled `react-native-svg` (`chart-radial.tsx`, `chart-scatter.tsx`)** — `ChartPolarArea` (equal-angle wedges whose radius scales with √value, so the *area* of a slice tracks its value), `ChartRadialBar` (concentric 270° tracks over a neutral track), `ChartProgressRing` (single ring with the value in the middle), `ChartRadar` (grid polygons, aster lines, truncated axis labels), `ChartScatter` (two-axis plot positioned by value, not by index; `bubble` sizes each marker by `weight`). None of them put `onPress` on an SVG node, so none leak responder props on web.
- **Layout-only (`chart-grid.tsx`)** — `ChartHeatmap` (week × weekday grid, cell opacity = intensity, optional `scaleLabels` for the ramp) and `ChartTreemap` (slice-and-dice flex split: no measurement, identical on native and web).
- **`ChartContainer` (`chart-container.tsx`)** — framing for one chart: `rounded-2xl border border-border bg-card p-4`, title + right-aligned subtitle, optional wrapping `legend` (dot + label + value) and `footer`. `loading` swaps the body for a `ChartSkeleton` of `height` — that is what staggered mounting looks like while `useChartReady(order)` waits.
- **`ChartSkeleton` / `ChartSkeletonList` (`chart-skeleton.tsx`)** — placeholders sized to the chart they stand in for.

**Web note:** `ChartLine` swaps its SVG data points for a `customDataPoint` view on web and `ChartStackedArea` hides data points outright — gifted-charts wires `onPress` onto those SVG circles, and react-native-svg then puts RN responder props on the DOM node, which React logs as unknown event handlers. Native keeps the SVG circles. `ChartRadar` is hand-drawn for the same class of reason: gifted-charts' `RadarChart` sets `translateX`/`translateY` on an SVG `<G>`, which reaches the DOM verbatim on web.

### SectionTitle (`section-title.tsx`)
Demo/dashboard section header: `<Text variant={default 'h3'}>` + 1px `bg-border` divider. `mt-6 mb-3 first:mt-0`.

### Gallery (`gallery.tsx`)
Responsive image grid (`columns`, `spacing`, `aspectRatio`, `borderRadius`, optional `showTitles`/`showDescriptions`/`showPages`). Tap opens fullscreen viewer with pinch-to-zoom (`MIN_SCALE 0.8` / `MAX_SCALE 4`, spring gestures), swipe pagination, download/share actions. Exposes `useImageZoom()` hook for custom zoom layouts.

### MediaPicker (`media-picker.tsx`)
Button-triggered image/video picker (`expo-image-picker` + media library): `mediaType` (`image`/`video`/`all`), `multiple`, `maxSelection`, `quality`, preview thumbnails of `selectedAssets`. Requests permissions through `loadExpoMediaLibrary`.

### InputOTP (`input-otp.tsx`)
Segmented one-time-code input: `length`, `masked`, `separator`, `showCursor`, `onComplete`, optional haptics on completion. Slots exposed via `slotStyle` (used for rounded/success/error themes in demos).

### Date & time (`date-picker.tsx`, `date-time-picker.tsx`)
`DatePicker` — custom date/date-range picker on `react-native-calendars` (returns `DateRange`). `DateTimePickerField` — native field wrapper on `@react-native-community/datetimepicker`.

### Media components (`src/components/ui/`)
- **`AudioPlayer` / `AudioRecorder` / `LiveWaveform`** — `expo-audio` playback + recording with live waveform, timer, progress bar, quality/max-duration options.
- **`Camera`** — camera capture view (imperative ref `CameraRef`).
- **`Video`** — `expo-video` player on native, HTML `<video>` on web (no `react-native-video` — Android media3 conflict).
- **`ParallaxScrollView`** — header-image scroll container with reanimated parallax, edge pull (spring `{ damping: 14, stiffness: 180, mass: 0.6 }`), respects `useReducedMotion`.

### Test / demo playground (`src/components/test/`)
- **`AdaptiveSlider`** (`adaptive-slider.tsx`) — calorie-goal slider card: gesture-driven track (`PanResponder`) with a `LinearGradient` fill that adapts to the active accent via `usePrimaryHex()`. Gradient stops are always **opaque** theme-derived tints (`mix(primary, white/black, …)`) — never alpha hexes. Surfaces are themed: `bg-card` + `border-border` shell, `bg-muted` track, `bg-primary/30` tick dots, `bg-background` thumb. Value readout is `text-foreground`, label `text-muted-foreground`.
- **`AnimatedNumber`** (`number-flow.tsx`) — thin wrapper over `number-flow-react-native`'s `NumberFlow` (digit-roll animation). Props: `value: number`, `format?: Intl.NumberFormatOptions`, `style?: TextStyle`. Use for any animated numeric readout (pricing, calories, stats).
- **`ChangeablePricingSection`** (`pricing-section.tsx`) — theme-adaptive pricing list. `bg-muted` shell + `bg-card` plan rows with `border-border` hairlines. Selection, radio, badge, and CTA all use the primary accent (`border-primary` / `bg-primary` / `text-primary`, tinted `primaryHex` shadow). The Monthly/Yearly billing switch is the **gooey `Tabs`** (`@/components/ui/tabs`), and the price is an `AnimatedNumber` (USD currency) so cycle changes roll the digits instead of remounting.
- **`WaveformScrub`** (`waveform-scrub.tsx`) — audio waveform scrubber: `bg-card` + `border-border` shell, `bg-muted` track, active wave + scrubber in `primaryHex`, inactive wave in `muted`. Theme + accent come from `useThemeColors()`/`usePrimaryHex()` (no `dark` prop — mode is automatic). Accepts an optional `source` (`expo-audio` `AudioSource`) — when provided, play/pause/scrub drive a real `useAudioPlayer` and duration/currentTime come from player status; without it, the simulated clock is used.
- **`TranscribeVoiceMessage`** (`transcribe-voice-message.tsx`) — voice-note player + reveal-as-you-play transcription bubble. Player pill + bubble are `bg-card` + `border-border`, active wave is `primaryHex`, transcription toggle switches to `bg-primary/10` + `border-primary` when open. Accepts an optional `source` (`expo-audio` `AudioSource`) — when provided, playback is driven by a real `useAudioPlayer`; without it, the simulated clock is used.
- **`KnobSlider`** (`knob-slider.tsx`) — circular knob dial: `bg-muted` outer ring, `bg-card` inner knob with `border-border`, `primaryHex` pointer + value digits in `text-foreground` (from `useThemeColors()`).
- **`GooeyMenu`** (`gooey-menu.tsx`) — liquid morphing quick-menu: `bg-muted` gooey surface (connector blobs + expanded body) with a `bg-primary` + `text-primary-foreground` `Sparkles` trigger button. Item text uses `text-foreground` / `text-muted-foreground` with accent-tinted value pills (`bg-primary/10`).
- **`WeightWidget`** (`weight-widget.tsx`) — weight dial: `bg-card` + `border-border` card, numbers in `text-foreground`, ticks in `muted`, indicator dot/triangle in `primaryHex`. Styling is Tailwind classes + inline `style` for dynamic values (no `StyleSheet.create`).
- **`ViewOnMap`** (`map-view.tsx`) — expandable Google Maps embed (`react-native-webview`): `bg-muted` surface, `text-foreground`/`text-muted-foreground` label, `bg-card` close button, loading overlay `bg-muted`. Styling is Tailwind classes + inline `style` (no `StyleSheet.create`).

### Card (`card.tsx`)
Data card with 7 variants: `stats` (default — `bg-card` + hairline `border-border`), `primary` (solid accent fill, white text), `secondary`, `compact` (tighter padding, `text-2xl` value), `action`, `mini` (row layout with accent gradient blush), `glass` (frosted `GlassView` surface with `border-white/20`, `dark:border-white/10`). Props: `title`, `value`, `subtitle`, optional lucide `icon` (44×44 tinted well), `children`, and `effect="gooey"` — pressable cards squash/stretch on press via the shared `useGooeyPress` hook. Surface: `rounded-2xl`, `border`, `overflow-hidden`.

### Form controls
- **Switch / Toggle / Checkbox / RadioGroup / Slider / Progress** — all tinted with primary accent. `Slider` takes `orientation` (`horizontal` default / `vertical`) and `verticalLength` (track px, default 160); vertical is a custom `Gesture.Pan` + Reanimated track (tight `activeOffsetY` so it wins the gesture race against the surrounding ScrollView — a rotated native slider gets its drag stolen by scroll), with tap-to-seek and a `border`-colored rail, `primaryHex` fill + thumb. `disabled` dims the whole control to `opacity-50`.
- **Switch** ships 4 variants: `default`, `liquid-glass`, `square`, and `gooey`. `gooey` uses an elongated pill-shaped knob (sizes `sm`/`md`/`lg` with fixed `trackW`/`knobW` ratios) that travels the track with a spring `{ damping: 13, stiffness: 150, mass: 0.9 }`, stretching in the direction of travel (`scaleX` 1→1.4→1, `scaleY` 1→0.85→1) while the track color interpolates `border` → `primaryHex`.
- **CalendarView** (`react-native-calendars`) for date selection with marked dates; **DateTimePickerField** (`@react-native-community/datetimepicker`) for native pickers; **DatePicker** for custom calendar/range selection.
- **Spinner** — `ActivityIndicator` via native `color` prop (hex from `useThemeColors`), sizes `sm`/`md`/`lg`.
- **Image** — `expo-image` wrapper; ALWAYS pass `contentFit` + `style={{ height: '100%', width: '100%' }}` or it renders blank on native.
- **InputOTP / MediaPicker** — segmented OTP input and gallery-aware image/video picker (see above).

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
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Tab switch on `@rn-primitives/tabs`. The `TabsList` indicator is a two-layer sliding pill: an outer layer tracks position/size with springs (`{ damping: 18, stiffness: 180 }` position, `{ damping: 20, stiffness: 200 }` size), and an inner **gooey stretch layer** that springs `scaleX` 1→1.08→1 (`withSequence`) on every switch — an overshoot that makes the pill feel like it squishes and settles into the new tab. Indicator = `bg-background shadow-sm dark:bg-input/30`. |
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
  - Drawer-only routes (no bottom tab) live under `(app)/`: `report` (full-page graphs), plus the demo/feature screens `dev-ui` (UI Components), `dev-forms` (Forms & Inputs), `dev-media` (Media & Audio), `dev-data` (Data & Tables), `charts`, `parallax`, `dev-onboarding`. `dev-preferences` is registered only in `__DEV__` via `DEV_NAV_ITEMS`.
  - Each demo route is a 1-line wrapper (`app/(app)/dev-ui.tsx`) re-exporting a screen from `src/screens/`.
  - Header titles come from `NAV_TITLE_MAP` (i18n keys), never hardcoded. Drawer toggle button sits at `ml-3` on native.
- **Demo screens** are thin orchestrators: a `ScrollView` + `SafeAreaInsets`, an intro `Text` block, then grouped sections each rendered by a co-located sub-component (grouped by theme — core, selection, feedback, content, overlays) introduced by `SectionTitle`. Mock data lives in `src/data/`, demo blocks in `src/components/demos/`, never inline in the screen.
- **Cards:** used when elevation communicates hierarchy (dashboard widgets, profile rows). In dense lists, prefer `border-b border-border` rows over card-stacking.
- **Dashboards/Report:** mixed grid — trend snapshot + hours distribution + top projects, then the chart gallery (`ChartsShowcase`): a chip row picks one category and only that category's tiles mount. Tiles flow by `flexBasis: 300` + `flexGrow`, so they are one-up on a phone and multi-column on web without a breakpoint. Don't render 3 identical equal cards in a row; vary sizing.

## 7. Motion & Interaction

- **Spring physics** (Reanimated): interactive springs `{ damping: 20, stiffness: 260 }`; heavier pushes `stiffness: 300`. Durations via `withTiming` only for fades (220ms backdrop). Shared presets live in `src/config/motion.ts` — `SPRING_PRESS` (press feedback: buttons, switches, checkboxes, radio, gooey squash) and `SPRING_GENTLE` (large surfaces). New components must import these instead of inlining spring literals.
- **Slide-in overlays** use `withTiming` with `Easing.out(Easing.quad)` — open 300ms, close 250ms (Side `Sheet`, `ActionSheet`). Chart draw-in uses `withTiming` over 800–2500ms; chart vertices/points stagger in with `withDelay` + `withSpring`.
- **Gesture-driven:** sheets/scroll panning via `react-native-gesture-handler`; `Modal` uses `GestureDetector`. Charts use `Gesture.Pan` for interactive tooltips; `Gallery` uses pinch + pan gestures for zoom/fullscreen; `ParallaxScrollView` uses a `Gesture.Pan` pull (`withSpring({ damping: 14, stiffness: 180, mass: 0.6 })`) simultaneous with the native scroll. Reanimated worklets via `react-native-worklets` (`scheduleOnRN`).
- **Micro-interactions:** pressed states (`opacity-80`), switch/checkbox accent transitions, slider drag with spring, haptics (`use-haptics` / `createHapticTrigger`) on action-sheet selection and OTP completion. Enter/exit animations on demos via Reanimated springs/timing (as in `Modal`).
- **Gooey effect (shared motion language):** a soft, liquid press/toggle/selection micro-interaction applied across interactive components — `Button effect="gooey"|"both"`, `Card effect="gooey"`, `Switch variant="gooey"`, and the `Tabs` sliding indicator. The reusable press implementation is the `useGooeyPress` hook (`src/hooks/use-gooey-press.ts`), which runs entirely on the UI thread. All instances share the same spring family (`damping` 10–20, `stiffness` 150–260, `mass` 0.5–0.9) and the same "stretch then settle" shape: the surface scales up in one axis and down in the other (`scaleX`/`scaleY` peaking around ±0.4–0.6 at mid-progress) before snapping back to rest. Transforms + opacity only — never layout props.
- **Performance rules:** animate only `transform` and `opacity`, never layout props; don't pass `Color`/`PlatformColor` into Reanimated styles (use static hex); avoid re-rendering whole screens on gesture progress. Never poll a `SharedValue` with a rAF/`setInterval` setState loop — observe it with `useAnimatedReaction` and cross to JS (`runOnJS`) only when the derived value changes (see `AnimatedCalories` in `adaptive-slider.tsx`). Heavy blocks below the fold (WebViews, gesture dials, audio players) mount deferred via `useChartReady(order)` behind a `Skeleton` (see `DeferredBlock` in `blocks-screen.tsx`).
- **Reduced motion:** respect system settings where feasible (`useReducedMotion` in `ParallaxScrollView`; opacity-only transitions degrade gracefully).

## 8. Cross-Platform Rules (Web + iOS + Android)

- Icons: lucide `color` prop + `useThemeColors()` hex — never `className` color.
- SVG artwork: pull colors from theme hooks / CSS variables, never hardcoded `#ffffff`. Chart axis/grid colors derive from `useThemeColors()`/`usePrimaryHex()`; only data series may carry explicit hexes (from `--color-chart-1` or the `src/data` mock data).
- `Image`: always `contentFit` + explicit `style` dimensions (web-only otherwise).
- Video/audio: `expo-video` + `expo-audio` on native, HTML `<video>` on web.
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
- Hardcoding mock/demo data inside a screen — put it in `src/data/` and the demo block in `src/components/demos/`.
- Hand-rolling `FlatList`/`ScrollView` tables when `<Table columns data />` covers the case.

## 10. Design Tokens Cheat-Sheet (for AI agents)

When generating a screen, default to:
- Canvas: `bg-background`; sections: `bg-card`; wells: `bg-secondary` or `bg-muted`.
- Text: `text-foreground` body, `text-muted-foreground` secondary.
- Dividers: `border-t border-border`.
- Primary action: `<Button title={t('...')} />` (accent). Secondary: `<Button variant="secondary" />`. Add `effect="gooey"` (or `"ripple"` / `"both"`) for a liquid press micro-interaction on hero/CTA buttons; use `Switch variant="gooey"` for the liquid toggle and rely on the built-in gooey stretch in `Tabs`.
- Inputs: `<Input label={...} />`; selection: `<RadioGroup/>`, `<Checkbox/>`, `<Switch/>`, or `<BottomSheet options={...} />`; OTP: `<InputOTP length={6} />`; media: `<MediaPicker multiple maxSelection={...} />`.
- Feedback: `<Spinner/>`, inline `text-destructive` errors, `<Toast/>` for transient alerts.
- Overlays: `<Modal variant="centered|bottom-sheet|centered-action" />` for dialogs, `<Sheet side="left|right" />` for edge panels, `<ActionSheet options={...} />` for context menus.
- Data: `<Table data columns />` for tabular data; charts via `<ChartContainer title={...}>` + `Chart`/`LineChart`/`RadarChart`/etc.
- Gallery/media: `<Gallery items columns spacing />`, `<AudioPlayer source />`, `<AudioRecorder />`, `<Camera />`, `<Video source />`.
- Section headers on demo/dashboard screens: `<SectionTitle title={...} />`.
- Radius: cards `rounded-xl`, controls `rounded-md`, buttons `rounded-lg`, edge-anchored overlays `rounded-t-2xl`.
- Rhythm: `px-4` gutters, `gap-4`, `py-4`.
- Icons: lucide + `color` from `useThemeColors()`.
- All copy: `t()` EN/FR. All colors: theme variables. All screens: safe-area aware.
- RNR structure & overlays: `Tabs`, `Accordion`, `Menubar`, `Popover`, `Select`, `Tooltip`, `Separator`, `Alert`, `Skeleton` from `@/components/ui` — same theme tokens. `Card` is the custom data-card (variants `primary`/`secondary`/`stats`/`compact`/`action`).

**Themes that must stay in sync when you change any token:**
1. `global.css` — neutral + radius + spacing tokens.
2. `src/config/color-palettes.ts` — accent palettes (light + dark).
3. `src/store/theme-store.ts` — mode (`light`/`dark`/`system`) + selected accent, persisted in MMKV.
4. `src/providers/theme-provider.tsx` — `Uniwind.setTheme` + `updateCSSVariables` + navigation theme.
