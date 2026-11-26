# Mobile QA checklist

A pre-release sweep on **real devices** (one small Android, one recent iPhone). Copy it into a GitHub issue per release, tick what passes, and record every unticked item as an accepted risk or a blocker.

Automated coverage first: `pnpm run checks` and the E2E workflow must be green before you start.

## 1. Accessibility

- [ ] Every `Pressable` / icon button has an `accessibilityLabel` (translated) and `accessibilityRole`.
- [ ] Touch targets are at least 44 × 44 pt / 48 × 48 dp (use `hitSlop` for small icons).
- [ ] Text contrast is at least 4.5:1 in light **and** dark mode.
- [ ] System font size at its largest: nothing is clipped. Containers use `minHeight`, not a fixed `height`.
- [ ] VoiceOver (iOS) and TalkBack (Android): every screen can be read and operated in a sensible order.

## 2. Theming

- [ ] Toggle light / dark / system on the device while each main screen is open: everything updates without a reload (no frozen screens).
- [ ] Each of the 7 accent palettes looks right on Home, Report and Settings.
- [ ] Status bar and navigation bar are legible on both themes; modals and bottom sheets follow the theme.

## 3. Performance

- [ ] Cold start to first interactive screen is under ~2.5 s on the small Android device (release build).
- [ ] Scrolling long lists and the Report charts holds 60 fps (Perf Monitor in the dev menu); the JS thread doesn't sit at 100%.
- [ ] No `console.log` noise in a release build's logcat / Console.
- [ ] Release APK size is noted; investigate jumps of more than 10% between releases (`npx expo-atlas`).
- [ ] Images are optimized (`pnpm run images:check`).

## 4. Localization

- [ ] Switch to French: every string is translated (no raw `common.navigation.x` keys), nothing truncates.
- [ ] Dates and numbers follow the app language.
- [ ] `pnpm run i18n:check` passes.

## 5. Storage & session

- [ ] Sign in, kill the app, relaunch: still signed in.
- [ ] Sign out, relaunch: lands on login, not home.
- [ ] **iOS:** uninstall and reinstall: starts at onboarding, signed out (Keychain leftovers are wiped on the first launch).
- [ ] Theme, accent and language survive a relaunch.

## 6. Permissions & notifications

- [ ] Deny each permission (camera, location, notifications, microphone): the app explains and keeps working.
- [ ] Grant it later from system settings: the feature works without reinstalling.
- [ ] A notification received while the app is killed opens the right screen.

## 7. Updates

- [ ] An OTA update on the release channel downloads and applies on next launch.
- [ ] A native change came with a `version` bump (`runtimeVersion` uses the `appVersion` policy).
