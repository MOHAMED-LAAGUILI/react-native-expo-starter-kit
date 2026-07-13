import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import { ENV } from './src/config/env.ts';

import 'dotenv/config';
import 'tsx/cjs';

const appIconBadgeConfig: AppIconBadgeConfig = {
  badges: [
    {
      color: 'white',
      text: 'preview',
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
      backgroundColor: '#ffffff',
      foregroundImage: './assets/images/adaptive-icon.png',
    },
    package: ENV.EXPO_PUBLIC_PACKAGE,
    userInterfaceStyle: 'light',
  },
  userInterfaceStyle: 'automatic',
  updates: {
    url: `https://u.expo.dev/${ENV.EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: 'appVersion',
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
    // @ts-expect-error - newArchEnabled && jsEngine is valid in Expo SDK 57
    jsEngine: 'jsc',
    backgroundColor: '#ffffff',
    bundleIdentifier: ENV.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    supportsTablet: true,
  },

  name: ENV.EXPO_PUBLIC_NAME,

  jsEngine: 'hermes',
  newArchEnabled: true,
  orientation: 'portrait',
  owner: ENV.EXPO_ACCOUNT_OWNER,
  plugins: [
    'expo-system-ui',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        imageWidth: 150,
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
    [
      'expo-navigation-bar',
      {
        enforceContrast: true,
        hidden: false,
        style: 'light',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: '36.0.0',
        },
        ios: {
          deploymentTarget: '16.4',
        },
      },
    ],
  ],
  scheme: ENV.EXPO_PUBLIC_SCHEME,
  slug: ENV.EXPO_PUBLIC_SLUG,

  version: ENV.EXPO_PUBLIC_VERSION,
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
    output: 'static',
  },
});
