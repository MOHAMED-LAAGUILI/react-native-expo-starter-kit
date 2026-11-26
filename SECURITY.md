# Security Policy

## Supported versions

| Version | Expo SDK | Supported |
|---------|----------|-----------|
| 6.x     | 58       | :white_check_mark: |
| < 6.0   | ≤ 57     | :x: — upgrade (see [docs/UPGRADING.md](docs/UPGRADING.md)) |

## Reporting a vulnerability

**Do not open a public issue.** Report it privately through GitHub: **Security → Report a vulnerability** on this repository ([private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).

Please include:

- a description and the affected version / file
- steps to reproduce (a minimal repro if possible)
- the impact you expect (data exposure, code execution, account takeover, …)
- a suggested fix, if you have one

You should get an acknowledgement within **48 hours** and a fix or mitigation plan within **7 days** for confirmed issues. You'll be credited in the release notes unless you prefer otherwise.

**In scope:** this starter's source (`app/`, `src/`), its configuration (`app.config.ts`, `eas.json`, `metro.config.js`, `pnpm-workspace.yaml`), scripts (`script/`), and CI workflows (`.github/`).
**Out of scope:** vulnerabilities in upstream packages (report them to the package — and tell us if the starter is exposed), and apps built on the starter that changed the relevant code.

## What the starter does for you

| Protection | Where |
|---|---|
| Tokens and user data are stored encrypted (iOS Keychain / Android Keystore), never in AsyncStorage or plain files; Keychain leftovers are wiped after an iOS reinstall | `src/storage` (expo-secure-store) |
| Secrets are excluded from Android auto-backup | `expo-secure-store` config plugin |
| Secret scanning on every pull request | `ci.yml` → gitleaks (`.gitleaks.toml`) |
| Local `.env*` files, signing keys and certificates never reach git or EAS uploads | `.gitignore`, `.easignore` (guarded by a test) |
| New package versions must be 7 days old before pnpm installs them; versions cannot downgrade trust; vulnerable transitive versions are overridden | `pnpm-workspace.yaml` (`minimumReleaseAge`, `trustPolicy`, `overrides`) |
| Install scripts are blocked except for an explicit allow-list | `pnpm-workspace.yaml` (`onlyBuiltDependencies` / `allowBuilds`) |
| Release builds ship without the dev-client launcher config (no dev-server URLs) | `app.config.ts` (`expo-dev-client` only for development) |
| iOS privacy manifest declares required-reason APIs and no tracking | `app.config.ts` (`privacyManifests`) |
| Release builds are minified with R8 (Android) | Expo SDK 58 default |
| Unit tests fail on any real network request | `__tests__/setup/no-real-network.js` |

## Best practices when building on the starter

- Never put a secret behind `EXPO_PUBLIC_*` — it is bundled into every app. Server keys belong on your server; native-config keys in EAS environment variables (`eas env:create --visibility sensitive`). See [docs/SECRETS.md](docs/SECRETS.md).
- Keep dependencies current: `pnpm run deps:check` (also weekly in CI) and `pnpm run upgrade:expo` for SDK upgrades.
- Run `pnpm run checks` before every commit (the pre-commit hook does).
- Leaked a secret? **Rotate it first**, then remove it from the code — rewriting git history does not un-leak it.
- Use EAS-managed signing credentials; never commit `*.jks`, `*.p12`, `*.p8` or provisioning profiles.
