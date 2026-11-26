# Secrets & sensitive data

## Rules

1. **Never commit a real secret.** `.env.example` holds placeholders only; the generated `.env.development|preview|production` files are git-ignored and per-machine (`pnpm run env:create`).
2. **`EXPO_PUBLIC_*` is public.** Anything with that prefix is inlined into the JS bundle that ships to every device — never put a server-side API key, signing secret or private token behind it.
3. **Native-config secrets** (e.g. a maps API key read by a config plugin) go into EAS environment variables (`eas env:create --visibility sensitive`) and reach the app at build time. They need a new build, not an OTA update; expose at most a boolean to JS.
4. **On-device secrets** — auth tokens, refresh tokens, the user record — are stored with `expo-secure-store` through `src/storage` (Keychain on iOS, Keystore-encrypted storage on Android). Don't add AsyncStorage or plain files for them. Keep values small (some iOS versions reject > ~2 KB).
5. **No secrets in logs** — don't `console.log` tokens or request headers; crash reporters must scrub them.
6. **Leaked a secret?** Rotate it first. Rewriting git history doesn't un-leak it: forks, clones and caches already have it.

## Scanning

- CI: the `secrets` job in `.github/workflows/ci.yml` runs [gitleaks](https://github.com/gitleaks/gitleaks) with `.gitleaks.toml` on every PR.
- Locally, before a push: `gitleaks protect --staged --redact --config=.gitleaks.toml`.
- False positives in docs, tests or templates: extend the `[allowlist]` in `.gitleaks.toml` — never disable the scan.

## Where things live

| Data | Store | Notes |
|---|---|---|
| Access / refresh token, user | `StorageService.auth` → SecureStore | attached to requests by the Axios interceptor (`src/api/client.ts`) |
| Theme, accent, language, onboarding flag | `StorageService.{theme,i18n,onboarding}` → SecureStore | not secret, but one storage layer keeps the app simple |
| Server data | TanStack Query cache (memory) | never persisted to secure storage |
| Signing keys (`*.jks`, `*.p12`, `*.p8`, `*.mobileprovision`) | EAS credentials | git-ignored and EAS-ignored |
