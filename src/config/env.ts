import packageJson from '../../package.json' with { type: 'json' };

const ExpoEnv = {
  EAS_PROJECT_ID: 'c9f5e022-1377-45e6-a3d2-3857b53df48d',
  EXPO_ACCOUNT_OWNER: 'gopitos-team',
  EXPO_PUBLIC_BUNDLE_ID: 'com.rntemplate.app',
  EXPO_PUBLIC_NAME: 'rn-template',
  EXPO_PUBLIC_PACKAGE: 'com.rntemplate.app',
  EXPO_PUBLIC_SCHEME: 'rn-template',
  EXPO_PUBLIC_SLUG: 'rn-template',
  EXPO_PUBLIC_VERSION: packageJson.version,
};

const runtimeEnv = {
  API_URL: process.env.API_URL ?? 'http://localhost:3000/api',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.ENABLE_CRASH_REPORTING === 'true',
  IS_DEV: process.env.NODE_ENV !== 'production',
};

export const ENV = {
  ...ExpoEnv,
  ...runtimeEnv,
};
