// Runs on the HOST inside Maestro's GraalJS runtime (not in the app).
//
// Fails fast when Metro is not serving the bundle E2E needs:
//   - Metro not reachable at METRO_HOST_URL     → nothing would load.
//   - the manifest's bundle URL has `lazy=true` → Metro was started with
//     plain `expo start`. A lazy bundle breaks dynamic `import()` without HMR,
//     so screens that load modules on demand hang on a white screen. Start
//     Metro with `pnpm run e2e:metro` (CI=1 EXPO_NO_METRO_LAZY=1) instead.
//
// Sets output.metroBundleUrl for later steps.

// Injected by Maestro: its runtime API plus the `env:` passed by the flow.
/* global maestro, http, json, output, METRO_HOST_URL */

// Maestro passes unset env vars through as the literal string "undefined".
function isSet(value) {
  return typeof value === 'string' && value !== '' && value !== 'undefined';
}

const metro = isSet(METRO_HOST_URL) ? METRO_HOST_URL : 'http://localhost:8081';
const platform = maestro.platform === 'ios' ? 'ios' : 'android';

const response = http.get(`${metro}/`, {
  headers: {
    'Accept': 'application/expo+json,application/json',
    'expo-platform': platform,
  },
});

if (response.status < 200 || response.status >= 300) {
  throw new Error(`Metro at ${metro} answered HTTP ${response.status} — is \`pnpm run e2e:metro\` running?`);
}

const manifest = json(response.body);
const bundleUrl = manifest && manifest.launchAsset && manifest.launchAsset.url;

if (!bundleUrl) {
  throw new Error('Metro manifest has no launchAsset.url — is this an Expo dev server?');
}
if (/[?&]lazy=true(&|$)/.test(bundleUrl)) {
  throw new Error(`Metro is serving a LAZY bundle (${bundleUrl}). Restart it with \`pnpm run e2e:metro\`.`);
}

output.metroBundleUrl = bundleUrl;
