# Maestro E2E flows

End-to-end flows that drive the real app on an emulator / simulator. Unit and component tests live in `__tests__/` — see [docs/TESTING.md](../docs/TESTING.md).

```
.maestro/
├── config.yaml            # which folders `maestro test .maestro` runs
├── smoke/                 # boots at all? run first when triaging
├── auth/                  # login validation, demo login + persisted session
├── navigation/            # drawer → drawer-only route (SDK 58 route registration)
├── demo/tour.yaml         # app tour recorded by `pnpm run demo:record` (not in the E2E suite)
├── subflows/              # called from flows, never run on their own
│   ├── launch.yaml        # clearState → open dev build on Metro → onboarding visible
│   ├── open-dev-build.yaml
│   ├── skip-onboarding.yaml
│   ├── demo-login.yaml
│   └── allow-system-prompts.yaml
└── scripts/
    └── metro-bundle-mode.js   # fails fast if Metro is down or serving a lazy bundle
```

## Running locally

1. Install the Maestro CLI (it is **not** an npm dependency):
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
   On Windows use WSL, or follow https://docs.maestro.dev.
2. Install a **dev build** on an emulator / simulator once (rebuild after native changes):
   ```bash
   npx expo run:android --device <avd-name>
   ```
3. Start Metro in E2E mode and leave it running:
   ```bash
   pnpm run e2e:metro
   ```
   `CI=1` turns off the file watcher (no EMFILE on big trees) and `EXPO_NO_METRO_LAZY=1` serves one eager bundle — a lazy bundle breaks dynamic `import()` without HMR and the flow hangs on a white screen. `scripts/metro-bundle-mode.js` refuses to continue against a plain `expo start`.
4. Run the suite (or one flow):
   ```bash
   pnpm run e2e:android
   pnpm run e2e:ios
   maestro test --platform android -e APP_ID=com.rntemplate.app .maestro/auth/demo-login.yaml
   ```

| Env var | Default | Meaning |
|---|---|---|
| `APP_ID` | passed by the `e2e:*` scripts | bundle id / package — every flow starts with `appId: ${APP_ID}` |
| `MAESTRO_METRO_URL` | `http://10.0.2.2:8081` | Metro as the **device** reaches it (Android emulator host alias; use your LAN IP for a phone) |
| `MAESTRO_METRO_HOST_URL` | `http://localhost:8081` | Metro as the **host** reaches it |

Parallel devices: `maestro --device emulator-5556 test …`.

## Conventions

- **One folder per area**, each listed in `config.yaml`.
- **Header comment** on every flow: `# Flow:` (what it proves) and `# Screens:` (the source files it exercises).
- **Reset first.** Every flow starts with `runFlow: ../subflows/launch.yaml` (`clearState`), so no flow depends on an earlier one. On iOS the Keychain survives `clearState`; `src/storage` wipes it on the first launch after a reinstall, so flows still start signed out.
- **Select by `testID`**, not by text, wherever the app renders one. IDs are kebab-case `<screen>-<element>` (`login-email`, `onboarding-skip`, `home-screen`, `drawer-toggle`). `__tests__/architecture/maestro-ids-exist.test.ts` fails if a flow references an ID no component renders — add the `testID` in the component in the same change.
- **Tags**: `smoke`, `auth`, `navigation`; `android-only` is excluded on iOS.
- **Input gotcha**: `tapOn` puts the cursor mid-field and `eraseText` only deletes what is before it — keep typed values short.
- ESLint's YAML rules reformat flows on `lint:fix` (quotes are dropped where YAML doesn't need them) — that's expected.

## CI

- `ci.yml` → `maestro-syntax` (every PR): `maestro check-syntax` on every flow, after a self-test proving a malformed flow is rejected.
- `e2e.yml` (push to `main`, manual): debug dev-client APK → Metro in E2E mode → API 34 x86_64 emulator → `.github/scripts/maestro-e2e.sh`. On failure, `maestro-out/` (logcat, screen recordings, JUnit, debug output) is uploaded as an artifact.
