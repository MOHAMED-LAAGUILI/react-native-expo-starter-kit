import { z } from 'zod';
import packageJson from '../../package.json' with { type: 'json' };

const envSchema = z.object({
  // Expo / EAS static config
  EAS_PROJECT_ID: z.string(),
  EXPO_ACCOUNT_OWNER: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_SLUG: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),

  // Runtime config (from process.env)
  API_URL: z.string().url(),
  ENABLE_ANALYTICS: z.boolean(),
  ENABLE_CRASH_REPORTING: z.boolean(),
  IS_DEV: z.boolean(),
  EXPO_PUBLIC_APP_ENV: z.string(),
});

export type Env = z.infer<typeof envSchema>;

const STRICT = process.env.STRICT_ENV_VALIDATION === '1';

const _env: Env = {
  EAS_PROJECT_ID: 'cfe6ef08-08d8-4090-9326-4f9bf8951555',
  EXPO_ACCOUNT_OWNER: 'gojmows-team',
  EXPO_PUBLIC_BUNDLE_ID: 'com.rntemplate.app',
  EXPO_PUBLIC_NAME: 'Expo App',
  EXPO_PUBLIC_PACKAGE: 'com.rntemplate.app',
  EXPO_PUBLIC_SCHEME: 'rn-template',
  EXPO_PUBLIC_SLUG: 'rn-template',
  EXPO_PUBLIC_VERSION: packageJson.version,
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  IS_DEV: process.env.NODE_ENV !== 'production',
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
};

function getValidatedEnv(env: Env): Env {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const errors = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    const msg = `❌ Invalid environment variables:\n${errors}\n💡 Tip: If you recently updated .env, try restarting with -c to clear cache.`;

    if (STRICT) {
      console.error(msg);
      throw new Error('Invalid environment variables');
    }

    console.warn(msg);
  }

  return parsed.success ? parsed.data : env;
}

export const ENV = STRICT ? getValidatedEnv(_env) : _env;
