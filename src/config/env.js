const packageJson = require("../../package.json");

const ExpoEnv = {
  EAS_PROJECT_ID: "0c576e76-ecd2-4efb-a5c5-24ea4ec0d5aa",
  EXPO_ACCOUNT_OWNER: "mejoxs-team",
  EXPO_PUBLIC_BUNDLE_ID: "com.rntemplate.app",
  EXPO_PUBLIC_NAME: "rn-template",
  EXPO_PUBLIC_PACKAGE: "com.rntemplate.app",
  EXPO_PUBLIC_SCHEME: "rn-template",
  EXPO_PUBLIC_SLUG: "rn-template",
  EXPO_PUBLIC_VERSION: packageJson.version,
};

const runtimeEnv = {
  API_URL: process.env.API_URL ?? "http://localhost:3000/api",
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
  ENABLE_CRASH_REPORTING: process.env.ENABLE_CRASH_REPORTING === "true",
  IS_DEV: process.env.NODE_ENV !== "production",
};

const ENV = {
  ...ExpoEnv,
  ...runtimeEnv,
};

module.exports = ExpoEnv;
module.exports.default = ExpoEnv;
module.exports.ENV = ENV;
