import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import { ENV } from './src/config/env.ts';

import 'dotenv/config';
import 'tsx/cjs';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: ENV.EXPO_PUBLIC_APP_ENV !== 'production',
  badges: [
    {
      text: ENV.EXPO_PUBLIC_APP_ENV ?? 'unknown',
      type: 'banner',
      color: 'white',
    },
    {
      text: ENV.EXPO_PUBLIC_VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

const plugins: ExpoConfig['plugins'] = [
  'expo-system-ui',
  [
    'expo-splash-screen',
    {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      imageWidth: 150,
      dark: {
        image: './assets/images/splash-icon-dark.png',
        backgroundColor: '#000000',
      },
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
  'expo-localization',
  'expo-router',
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
  [
    'expo-video',
    {
      supportsBackgroundPlayback: true,
      supportsPictureInPicture: true,
    },
  ],
  [
    'expo-notifications',
    {
      icon: './assets/images/favicon.png',
      color: '#ffffff',
      defaultChannel: 'default',
      sounds: [],
      enableBackgroundRemoteNotifications: false,
    },
  ],
  ['expo-image-picker'],
  [
    'expo-location',
    {
      locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
    },
  ],
  [
    'expo-audio',
    {
      microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
      enableBackgroundPlayback: true,
      enableBackgroundRecording: false,
    },
  ],
  ['expo-asset'],
  ['expo-image'],
  [
    'expo-camera',
    {
      cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
      microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
      recordAudioAndroid: true,
    },
  ],
  ['app-icon-badge', appIconBadgeConfig],
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
  description: `${ENV.EXPO_PUBLIC_NAME} is a cross-platform mobile application engineered with modern technologies, optimized for performance, scalability, and maintainability.`,
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: ENV.EAS_PROJECT_ID,
    },
  },
  icon: './assets/images/favicon.png',
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
  plugins,
  scheme: ENV.EXPO_PUBLIC_SCHEME,
  slug: ENV.EXPO_PUBLIC_SLUG,
  version: ENV.EXPO_PUBLIC_VERSION,
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
    output: 'static',
  },
});
