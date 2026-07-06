import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import 'dotenv/config';

import 'tsx/cjs';

import Env from './env';


const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  badges: [
    {
      text: process.env.NODE_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.EXPO_PUBLIC_VERSION,
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  slug: Env.EXPO_PUBLIC_SLUG,
  version: Env.EXPO_PUBLIC_VERSION,
  description: `${Env.EXPO_PUBLIC_NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  scheme: Env.EXPO_PUBLIC_SCHEME,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#ffffff',
  // @ts-expect-error - newArchEnabled is valid in Expo SDK 57
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    backgroundColor: '#ffffff',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    userInterfaceStyle: 'light',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#2E3C4B',
    },
    package: Env.EXPO_PUBLIC_PACKAGE,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-system-ui',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#2E3C4B',
        image: './assets/images/splash.png',
        resizeMode: 'contain',
        imageWidth: 150,
      },
    ],
    [
        "expo-dev-client",
        {
          launchMode: "most-recent",
          defaultLaunchURL: "http://localhost:8081",
          android: {
            defaultLaunchURL: "http://10.0.0.2:8081"
          }
        }
      ],
    [
      'expo-font',
      {
        ios: {
          fonts: [
            'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf',
            'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
            'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf',
            'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf',
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: 'Inter',
              fontDefinitions: [
                {
                  path: 'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf',
                  weight: 400,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
                  weight: 500,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf',
                  weight: 600,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf',
                  weight: 700,
                },
              ],
            },
          ],
        },
      },
    ],
    'expo-localization',
    'expo-router',
    ['app-icon-badge', appIconBadgeConfig],
    'expo-status-bar',
    ['react-native-edge-to-edge'],

  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: Env.EAS_PROJECT_ID,
    },
  },
});
