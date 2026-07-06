import packageJson from './package.json';

const Env = {
  EXPO_PUBLIC_SLUG: "rn-template",
  EAS_PROJECT_ID: "0c576e76-ecd2-4efb-a5c5-24ea4ec0d5aa",
  EXPO_ACCOUNT_OWNER: "mejoxs-team",
  EXPO_PUBLIC_NAME: "rn-template",
  EXPO_PUBLIC_VERSION: packageJson.version,
  EXPO_PUBLIC_SCHEME: "rn-template",
  EXPO_PUBLIC_BUNDLE_ID: "com.rntemplate.app",
  EXPO_PUBLIC_PACKAGE: "com.rntemplate.app",
} as const;

export default Env;