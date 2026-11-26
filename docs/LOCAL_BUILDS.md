# Local builds (no EAS)

`pnpm run build:local:android` builds a release APK on your machine — no EAS cloud build, no queue, no build credits. It is the fastest way to put a preview build on a phone.

```bash
pnpm run build:local:android                          # preview profile
pnpm run build:local:install                          # …and adb install -r on the connected device
pnpm run build:local:android -- --emulator            # add x86_64 so it runs on emulators
pnpm run build:local:android -- --profile production  # production env, still debug-signed
pnpm run build:local:android -- --arch arm64-v8a      # override the ABIs
pnpm run build:local:android -- --clean               # regenerate android/ from scratch
```

Output: `dist/<name>-<version>-<profile>[-emulator]-<YYYYMMDD-HHmm>.apk`.

## What it does

1. Reads `build.<profile>` from `eas.json`, so a local preview build matches an EAS preview build: the profile's `env` (e.g. `EXPO_PUBLIC_APP_ENV`) and the ABIs from `android.gradleCommand` (`-PreactNativeArchitectures=…`).
2. Checks `.env.<env>` exists (`pnpm run env:create` makes it).
3. `expo prebuild --platform android --no-clean` — keeps `android/` and its Gradle/C++ caches between builds. Pass `--clean` after adding/removing a native dependency or changing a config plugin.
4. Writes `android/local.properties` (`sdk.dir`; on Windows also `cmake.dir` → the newest CMake 3.30+, which handles paths over 260 characters).
5. `gradlew assembleRelease`. On Windows a failed build often leaves `classes.jar` locked, so it stops the Gradle daemon and retries once.
6. Copies the APK to `dist/` and optionally installs it.

## Requirements

- JDK 17, Android SDK (`ANDROID_HOME`, or the default install location), and on Windows CMake 3.30+ from SDK Manager → SDK Tools.
- A cold first build takes 15–30 minutes; later builds reuse the Gradle cache.

## Limits

- The APK is signed with the **debug keystore** — fine for sideloading and QA, **not** accepted by the Play Store. Store builds: `pnpm run build:prod:android` (EAS).
- Android only. iOS local release builds need Xcode on macOS: `npx expo run:ios --configuration Release`.
- Release builds enable R8 minification by default since SDK 58. If a library relies on reflection and crashes only in release, add keep rules via `expo-build-properties`, or opt out with `android.enableMinifyInReleaseBuilds: false`.
