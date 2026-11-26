# Upgrading Expo SDK

## Procedure

1. Stop everything that holds `node_modules` (Metro, Gradle, editors' TypeScript servers) — on Windows an overlapping install dies with `EPERM` / `EBUSY` half-way. `pnpm run guard` checks.
2. Bump and align:
   ```bash
   node node_modules/expo/bin/cli install expo@^<NN>.0.0 --fix
   ```
   Prefer this over `npx expo install`: newer npm resolves `npx expo` from the wrong directory in this repo and fails with `Cannot find module …\expo\bin\cli`.
3. If the install fails with `EPERM … rename …_tmp_…`, an in-place update could not swap a folder Windows had open. Delete `node_modules` and run `pnpm install` (a fresh install never renames over existing folders).
4. Bump what `--fix` doesn't: `@types/react` to the new React minor, `@react-native/metro-config` to the new RN version, `@expo/config`.
5. `pnpm run checks`, then read the SDK's [release notes](https://expo.dev/changelog) and the [Expo Router migration guide](https://docs.expo.dev/router/migrate/).
6. Rebuild the dev client (`npx expo run:android`) — an SDK bump always changes native code.
7. Bump `version` in `package.json`: `runtimeVersion` uses the `appVersion` policy, so a native change must ship as a new version or OTA updates would target binaries that can't run them.

## SDK 57 → 58 (this repo)

| Change | What we did |
|---|---|
| React Native 0.86 → 0.88, React 19.2 → 19.3 | `@types/react` ~19.3, `@react-native/metro-config` 0.88 |
| `InteractionManager` removed | `useChartReady` uses `requestIdleCallback` (+ fallback) |
| `TextInput` / `View` are typed as components; instances are `TextInputInstance` / `ViewInstance` | `input.tsx`, `input-otp.tsx`, `media-picker.tsx` refs |
| `TextInputKeyPressEventData` → `TextInputKeyPressEvent` | `input-otp.tsx` |
| Gesture Handler 3: `PanGesture` is the new hook-API type | legacy builder type imported as `LegacyPanGesture` (`adaptive-slider`, `waveform-scrub`); migrating to `usePanGesture` is a follow-up |
| Drawer / Tabs only register screens **declared in the layout** | `DRAWER_ROUTES` in `app/(app)/_layout.tsx`; hidden `profile` tab; guarded by `__tests__/architecture/routes-declared.test.ts` |
| `freezeOnBlur` is a no-op | not used (freezing breaks Uniwind theme updates anyway) |
| `react-native-edge-to-edge` deprecated — edge-to-edge is built in | package and config plugin removed |
| `web.output` defaults to `"server"` | already explicit `"static"` |
| Android R8 on by default in release | documented in [LOCAL_BUILDS.md](LOCAL_BUILDS.md) |
| Storage (done alongside the upgrade) | `react-native-mmkv` + `react-native-nitro-modules` replaced by `expo-secure-store` behind the same `StorageService` API — see [SECRETS.md](SECRETS.md). Existing MMKV data is not migrated: users start signed out after updating. |

Not applicable here (checked): `initialRouteName`, `+html.tsx`, `expo-router/head`, custom routers, `navigation.dispatch` functions, expo-file-system `File.write`, expo-sqlite libSQL.
