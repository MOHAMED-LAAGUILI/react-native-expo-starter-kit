/// <reference types="node" />
/**
 * Curated knowledge about this starter's dependencies: what each heavy or
 * overlapping package costs, and the lighter / better-maintained option.
 *
 * Shared by `pnpm run deps:check` (lists entries for installed packages) and
 * `pnpm run perf:bundle` (prints them next to the measured bundle bytes).
 * Measured sizes always come from the bundle report — nothing here claims a
 * byte count. Review this list on every SDK upgrade.
 *
 *   native  swapping it changes native code → version bump + new dev build
 *   effort  S < 1 h · M a few hours · L a day or more
 */

export type Alternative = {
  /** npm package this applies to. */
  pkg: string
  kind: 'heavy' | 'overlap' | 'unused' | 'modernize'
  why: string
  instead: string
  native: boolean
  effort: 'S' | 'M' | 'L'
}

export const ALTERNATIVES: Alternative[] = [
  {
    pkg: 'react-native-calendars',
    kind: 'heavy',
    why: 'pulls in moment, xdate and recyclerlistview; renders every visible day as a React component',
    instead: '@marceloterreiro/flash-calendar (FlashList-based, no date library) — or build on the existing Calendar UI with date-fns',
    native: false,
    effort: 'M',
  },
  {
    pkg: 'react-native-gifted-charts',
    kind: 'heavy',
    why: 'animates on the JS thread (see useChartReady); 17 chart types ship even if an app uses two',
    instead: 'keep for light dashboards; for heavy/real-time charts, victory-native (Skia, UI thread) — adds the Skia binary, so measure first',
    native: false,
    effort: 'L',
  },
  {
    pkg: 'axios',
    kind: 'modernize',
    why: 'a second HTTP stack on top of fetch, which React Native already ships',
    instead: 'a ~60-line fetch wrapper in src/api/client.ts (AbortController timeout, auth header, 401 refresh queue)',
    native: false,
    effort: 'M',
  },
  {
    pkg: '@react-native-community/netinfo',
    kind: 'overlap',
    why: 'community module for connectivity state',
    instead: 'expo-network (useNetworkState) — Expo-maintained, versioned with the SDK',
    native: true,
    effort: 'S',
  },
  {
    pkg: 'react-native-toast-message-ts',
    kind: 'modernize',
    why: 'fork of an older toast library',
    instead: 'sonner-native (gesture + reanimated, stacked toasts) or burnt (system-native toasts)',
    native: false,
    effort: 'S',
  },
  {
    pkg: '@react-native-community/datetimepicker',
    kind: 'modernize',
    why: 'community picker with platform-specific UX differences',
    instead: 'evaluate @expo/ui DateTimePicker (SwiftUI / Jetpack Compose, versioned with the SDK)',
    native: true,
    effort: 'M',
  },
  {
    pkg: 'date-fns',
    kind: 'heavy',
    why: 'tree-shakes well, but most formatting is covered by Intl, which Hermes supports',
    instead: 'Intl.DateTimeFormat / Intl.RelativeTimeFormat for formatting; keep date-fns only for date arithmetic',
    native: false,
    effort: 'S',
  },
  {
    pkg: 'zod',
    kind: 'modernize',
    why: 'Zod 3 is the largest schema library in common use',
    instead: 'Zod 4 (`zod/mini` for a tree-shakable core, faster parsing) or valibot',
    native: false,
    effort: 'M',
  },
  {
    pkg: '@tanstack/react-query-devtools',
    kind: 'heavy',
    why: 'web-only devtools listed as a runtime dependency — bundled into native unless imported lazily',
    instead: 'load it with a dynamic import() behind isWeb && __DEV__ so native bundles never include it',
    native: false,
    effort: 'S',
  },
  {
    pkg: 'react-native-keyboard-controller',
    kind: 'unused',
    why: 'installed (native code in every build) but not imported anywhere',
    instead: 'adopt it — KeyboardProvider at the root + KeyboardAwareScrollView in forms is the best keyboard UX on RN — or remove it',
    native: true,
    effort: 'S',
  },
  {
    pkg: 'reanimated-color-picker',
    kind: 'heavy',
    why: 'demo-only component in a starter most apps will not need',
    instead: 'keep behind the demo screens, or drop it from app templates built on this starter',
    native: false,
    effort: 'S',
  },
  {
    pkg: 'number-flow-react-native',
    kind: 'heavy',
    why: 'demo-only animated numbers',
    instead: 'keep for the demo, or a Reanimated text tween for a single counter',
    native: false,
    effort: 'S',
  },
  {
    pkg: 'babel-plugin-module-resolver',
    kind: 'modernize',
    why: 'Metro resolves tsconfig `paths` natively; with no custom Babel plugins, SDK 58 can use its experimental Rust transformer',
    instead: 'drop it (and the explicit reanimated plugin — babel-preset-expo adds the Worklets plugin itself), then try experiments.noxcturnalTransformWorker',
    native: false,
    effort: 'M',
  },
];

/** Known transitive weight, attributed to whoever pulls it in. */
export const TRANSITIVE_HINTS: Record<string, string> = {
  'moment': 'pulled in by react-native-calendars',
  'xdate': 'pulled in by react-native-calendars',
  'recyclerlistview': 'pulled in by react-native-calendars',
  'gifted-charts-core': 'pulled in by react-native-gifted-charts',
  'lodash': 'check `pnpm why lodash` — usually a transitive dependency',
};

export function alternativeFor(pkg: string): Alternative | undefined {
  return ALTERNATIVES.find(entry => entry.pkg === pkg);
}
