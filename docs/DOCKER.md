# Docker

Build the Android app and run it in an emulator without installing Android Studio, the SDK or a JDK on your machine.

```bash
pnpm run docker:build      # release APK built in Linux → dist/*.apk (arm64 + x86_64)
pnpm run docker:emulator   # Android 14 emulator, installs the newest APK and opens it
                           # → watch at http://localhost:6080 (noVNC in your browser)
pnpm run docker:down       # stop it (named volumes keep node_modules and the Gradle cache)
```

## What's in `compose.yaml`

| Service | Image | What it does |
|---|---|---|
| `android-build` | `docker/android.Dockerfile` — Node 22, pnpm, JDK 17, Android SDK Platform 37, Build-Tools 37, NDK 27.1, CMake 3.22 | `pnpm install` → `env:create` → `build:local:android --emulator` (the same script as on your machine). `node_modules`, `android/` and `~/.gradle` are named volumes, so Linux binaries never touch your host's `node_modules`. |
| `emulator` | [`budtmo/docker-android:emulator_14.0`](https://github.com/budtmo/docker-android) | Android 14 emulator; noVNC on `:6080`, adb on `:5555` (`adb connect localhost:5555` from the host works too). |
| `installer` | the build image | Waits for the emulator to boot, installs the newest `dist/*.apk`, launches `com.rntemplate.app` (`docker/install-on-emulator.sh`). |

## Requirements

- **Docker** (Desktop on Windows/macOS, Engine on Linux). `pnpm run setup:check` reports it.
- **The emulator needs hardware virtualisation (KVM).** It runs on a Linux host, or Windows 11 with WSL2 nested virtualisation enabled. It **does not run on macOS** (Docker Desktop has no KVM there) — use the Android Studio emulator instead. `docker:build` works everywhere.
- Disk: ~10 GB for the images and caches; the first build takes 20–40 minutes, later ones reuse the Gradle volume.

## iOS

iOS cannot be containerised: the iOS Simulator and Xcode only run on macOS, and Apple's licence forbids virtualising them on other hardware. For iOS use a Mac (`npx expo run:ios`) or EAS (`pnpm run build:prev:ios`).

## Notes

- The APK is a **release build signed with the debug key** — it bundles its own JavaScript, so no Metro server is needed in Docker. It is for QA and demos, not the Play Store.
- Bump the SDK versions in `docker/android.Dockerfile` together with an Expo SDK upgrade (`app.config.ts` → `expo-build-properties`, React Native's NDK).
- Reset everything: `docker compose down -v` (also deletes the cache volumes).
