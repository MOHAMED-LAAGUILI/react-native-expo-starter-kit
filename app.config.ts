import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import { ENV } from './src/config/env.ts';

import 'dotenv/config';
import 'tsx/cjs';

const appIconBadgeConfig: AppIconBadgeConfig = {
  badges: [
    {
      color: 'white',
      text: process.env.NODE_ENV,
      type: 'banner',
    },
    {
      color: 'white',
      text: ENV.EXPO_PUBLIC_VERSION,
      type: 'ribbon',
    },
  ],
  enabled: process.env.NODE_ENV !== 'production',
};

const fontPlugin: ['expo-font', { android: { fonts: Array<{ fontFamily: string; fontDefinitions: Array<{ path: string; weight: number }> }> }; ios: { fonts: string[] } }] = [
  'expo-font',
  {
    android: {
      fonts: [
        {
          fontDefinitions: [
            { path: 'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf', weight: 400 },
            { path: 'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf', weight: 500 },
            { path: 'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf', weight: 600 },
            { path: 'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf', weight: 700 },
          ],
          fontFamily: 'Inter',
        },
      ],
    },
    ios: {
      fonts: [
        'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf',
        'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
        'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf',
        'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf',
      ],
    },
  },
];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: '#2E3C4B',
      foregroundImage: './assets/images/adaptive_icon.png',
    },
    package: ENV.EXPO_PUBLIC_PACKAGE,
    permissions: ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'],
    userInterfaceStyle: 'light',
  },
  assetBundlePatterns: ['**/*'],
  backgroundColor: '#ffffff',
  description: `${ENV.EXPO_PUBLIC_NAME} Mobile App`,
  experiments: {
    typedRoutes: true,
  },

  extra: {
    eas: {
      projectId: ENV.EAS_PROJECT_ID,
    },
  },
  icon: './assets/images/icon.png',
  ios: {
    backgroundColor: '#ffffff',
    bundleIdentifier: ENV.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    supportsTablet: true,
  },

  name: ENV.EXPO_PUBLIC_NAME,
  // @ts-expect-error - newArchEnabled is valid in Expo SDK 57
  newArchEnabled: true,
  orientation: 'portrait',
  owner: ENV.EXPO_ACCOUNT_OWNER,
  plugins: [
    'expo-system-ui',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#2E3C4B',
        image: './assets/images/splash.png',
        imageWidth: 150,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-dev-client',
      {
        android: {
          defaultLaunchURL: 'http://10.0.0.2:8081',
        },
        defaultLaunchURL: 'http://localhost:8081',
        launchMode: 'most-recent',
      },
    ],
    fontPlugin,
    'expo-localization',
    'expo-router',
    ['app-icon-badge', appIconBadgeConfig],
    'expo-status-bar',
    ['react-native-edge-to-edge'],
  ],
  scheme: ENV.EXPO_PUBLIC_SCHEME,
  slug: ENV.EXPO_PUBLIC_SLUG,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  userInterfaceStyle: 'automatic',
  version: ENV.EXPO_PUBLIC_VERSION,
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
    output: 'static',
  },
});
