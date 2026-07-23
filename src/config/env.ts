import packageJson from '../../package.json' with { type: 'json' };

const ExpoEnv = {
  EAS_PROJECT_ID: 'f694ab33-a127-4d40-849a-25cc77a37ef1',
  EXPO_ACCOUNT_OWNER: 'zacvasbs-team',
  EXPO_PUBLIC_BUNDLE_ID: 'com.rntemplate.app',
  EXPO_PUBLIC_NAME: `Expo App - ${packageJson.version}`,
  EXPO_PUBLIC_PACKAGE: 'com.rntemplate.app',
  EXPO_PUBLIC_SCHEME: 'rn-template',
  EXPO_PUBLIC_SLUG: 'rn-template',
  EXPO_PUBLIC_VERSION: packageJson.version,
};

const runtimeEnv = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  IS_DEV: process.env.NODE_ENV !== 'production',
};

export const ENV = {
  ...ExpoEnv,
  ...runtimeEnv,
};
