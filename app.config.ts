// Expo app config (there is no app.json — when both exist Expo merges them,
// which hides half the config from whoever reads one). TypeScript so a
// mistyped key fails `tsc` instead of `expo prebuild`, and so the config can
// branch on the EAS build profile.
//
// Native config: changing anything below except `extra` needs a new build
// and a `version` bump in package.json (runtimeVersion uses the appVersion
// policy) — an OTA update cannot carry it.
import type { ConfigContext, ExpoConfig } from 'expo/config';
import { withGradleProperties } from 'expo/config-plugins';
import { ENV } from './src/config/env.ts';

import 'dotenv/config';
import 'tsx/cjs';

const APP_NAME = ENV.EXPO_PUBLIC_NAME;

// ── iOS permission purpose strings (EN in Info.plist, FR via `locales`) ─────
// One place for every prompt, in both app languages. They are user-facing
// copy: change EN and FR together. No double quotes — Expo writes these into
// .strings files without escaping. Plugin options below deliberately pass no
// purpose strings: a plugin option overrides ios.infoPlist with generic text.
const IOS_PURPOSE_STRINGS = {
  en: {
    camera: `${APP_NAME} uses the camera to take photos and scan QR codes.`,
    microphone: `${APP_NAME} uses the microphone to record audio and video.`,
    photoLibrary: `${APP_NAME} uses your photo library so you can choose photos and videos to attach.`,
    photoLibraryAdd: `${APP_NAME} saves photos and videos you create to your library.`,
    locationWhenInUse: `${APP_NAME} uses your location to show where you are while you use the app.`,
    locationAlways: `${APP_NAME} uses your location to show where you are, also when the app is in the background.`,
    faceId: `${APP_NAME} uses Face ID to protect the data it stores on this device.`,
  },
  fr: {
    camera: `${APP_NAME} utilise l'appareil photo pour prendre des photos et scanner des QR codes.`,
    microphone: `${APP_NAME} utilise le micro pour enregistrer de l'audio et de la vidéo.`,
    photoLibrary: `${APP_NAME} utilise votre photothèque pour que vous puissiez joindre des photos et des vidéos.`,
    photoLibraryAdd: `${APP_NAME} enregistre dans votre photothèque les photos et vidéos que vous créez.`,
    locationWhenInUse: `${APP_NAME} utilise votre position pour vous situer pendant que vous utilisez l'application.`,
    locationAlways: `${APP_NAME} utilise votre position pour vous situer, y compris lorsque l'application est en arrière-plan.`,
    faceId: `${APP_NAME} utilise Face ID pour protéger les données qu'elle enregistre sur cet appareil.`,
  },
} as const;

type PurposeStrings = (typeof IOS_PURPOSE_STRINGS)[keyof typeof IOS_PURPOSE_STRINGS];

function purposeStringEntries(strings: PurposeStrings): Record<string, string> {
  return {
    NSCameraUsageDescription: strings.camera,
    NSMicrophoneUsageDescription: strings.microphone,
    NSPhotoLibraryUsageDescription: strings.photoLibrary,
    NSPhotoLibraryAddUsageDescription: strings.photoLibraryAdd,
    NSLocationWhenInUseUsageDescription: strings.locationWhenInUse,
    NSLocationAlwaysAndWhenInUseUsageDescription: strings.locationAlways,
    // Legacy key — expo-location fills it with generic text when absent.
    NSLocationAlwaysUsageDescription: strings.locationAlways,
    // expo-secure-store adds this key (requireAuthentication); give it real copy.
    NSFaceIDUsageDescription: strings.faceId,
  };
}

const IOS_INFO_PLIST: NonNullable<ExpoConfig['ios']>['infoPlist'] = {
  ...purposeStringEntries(IOS_PURPOSE_STRINGS.en),
  // Lets iOS use the FR InfoPlist.strings with the app's in-app language switch.
  CFBundleAllowMixedLocalizations: true,
  ITSAppUsesNonExemptEncryption: false,
};

// Under `ios` so Android's strings.xml gets none of them.
const LOCALES: ExpoConfig['locales'] = {
  fr: { ios: purposeStringEntries(IOS_PURPOSE_STRINGS.fr) },
};

// ── Apple privacy manifest ──────────────────────────────────────────────────
// App Store Connect rejects an upload that calls a required-reason API without
// a declared reason (ITMS-91053). Expo modules ship their own manifests; the
// app declares the categories React Native and its libraries reach:
//   CA92.1  UserDefaults — data only this app uses (RN, expo-secure-store)
//   C617.1  FileTimestamp — files in the app container (expo-file-system, expo-image)
//   35F9.1  SystemBootTime — elapsed time between in-app events (RN)
//   E174.1  DiskSpace — check for room before writing files (expo-file-system)
// NSPrivacyCollectedDataTypes must match your App Store privacy label: add an
// entry for every kind of user data your backend or SDKs collect.
const IOS_PRIVACY_MANIFESTS: NonNullable<ExpoConfig['ios']>['privacyManifests'] = {
  NSPrivacyTracking: false,
  NSPrivacyTrackingDomains: [],
  NSPrivacyAccessedAPITypes: [
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
  ],
  NSPrivacyCollectedDataTypes: [],
};

// Store builds get no dev-client options: release builds compile the dev menu
// out, but these options would still leave the dev server URL in native config.
// EAS sets EAS_BUILD_PROFILE; local builds (no profile) keep the dev client.
const RELEASE_PROFILES = ['preview', 'production'];
const IS_RELEASE_BUILD = RELEASE_PROFILES.includes(process.env.EAS_BUILD_PROFILE ?? '');

const plugins: ExpoConfig['plugins'] = [
  // Core
  'expo-router',
  // Persisted state lives in the Keychain / Keystore (src/storage). The plugin
  // excludes it from Android auto-backup: a restored backup could not be
  // decrypted on a new device's keystore and would fail every read.
  'expo-secure-store',
  'expo-localization',
  'expo-system-ui',
  'expo-status-bar',
  'expo-asset',
  'expo-font',
  'expo-image',
  // Store gates. Google Play rejects new apps and updates that target below
  // API 36 (Android 16), so target is pinned rather than left to a template
  // default. Expo SDK 58 / RN 0.88 libraries compile against SDK 37; compileSdk
  // only exposes newer APIs, runtime behaviour follows targetSdk.
  // Release builds minify with R8 (SDK 58 default). A library that reaches a
  // class by reflection and ships no keep rules crashes only in release — add
  // `extraProguardRules` here, or set enableMinifyInReleaseBuilds: false.
  // iOS 16.4 is the Expo SDK 58 minimum (every expo-* podspec requires it).
  [
    'expo-build-properties',
    {
      android: {
        compileSdkVersion: 37,
        targetSdkVersion: 36,
        buildToolsVersion: '37.0.0',
      },
      ios: {
        deploymentTarget: '16.4',
      },
    },
  ],
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
    'expo-navigation-bar',
    {
      enforceContrast: true,
      hidden: false,
      style: 'light',
    },
  ],
  [
    'expo-notifications',
    {
      // Android draws only the alpha channel: use a white silhouette on
      // transparency, or the icon becomes a white square.
      icon: './assets/images/favicon.png',
      color: '#ffffff',
      defaultChannel: 'default',
      sounds: [],
      enableBackgroundRemoteNotifications: false,
    },
  ],
  // Purpose strings come from IOS_INFO_PLIST (see the note above it).
  ['expo-camera', { recordAudioAndroid: true }],
  ['expo-image-picker'],
  ['expo-location', { motionUsagePermission: false }],
  [
    'expo-audio',
    {
      enableBackgroundPlayback: true,
      enableBackgroundRecording: false,
    },
  ],
  [
    'expo-video',
    {
      supportsBackgroundPlayback: true,
      supportsPictureInPicture: true,
    },
  ],
  // Edge-to-edge is built into Android since SDK 54 — no plugin needed.
  ...(IS_RELEASE_BUILD
    ? []
    : ([
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
      ] satisfies NonNullable<ExpoConfig['plugins']>)),
];

// EAS Android builders have 4 vCPUs / ~16 GB. Gradle's 4 GB heap, a Kotlin
// daemon that inherits it, and four parallel C++ compiles can run the box out
// of memory ("daemon disappeared unexpectedly", then a silent hang until the
// build timeout). A smaller Kotlin heap and three workers keep it under.
const GRADLE_BUILD_MEMORY: Record<string, string> = {
  'kotlin.daemon.jvmargs': '-Xmx2g -XX:MaxMetaspaceSize=512m',
  'org.gradle.workers.max': '3',
};

export default ({ config }: ConfigContext): ExpoConfig => withGradleProperties({
  ...config,
  name: APP_NAME,
  owner: ENV.EXPO_ACCOUNT_OWNER,
  slug: ENV.EXPO_PUBLIC_SLUG,
  // From package.json (via src/config/env.ts). appVersionSource is "remote",
  // so EAS owns the build numbers — don't add versionCode / buildNumber here.
  version: ENV.EXPO_PUBLIC_VERSION,
  description: `${APP_NAME} is a cross-platform mobile application engineered with modern technologies, optimized for performance, scalability, and maintainability.`,
  scheme: ENV.EXPO_PUBLIC_SCHEME,
  orientation: 'portrait',
  icon: './assets/images/favicon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#ffffff',
  assetBundlePatterns: ['**/*'],
  platforms: ['ios', 'android', 'web'],
  ios: {
    bundleIdentifier: ENV.EXPO_PUBLIC_BUNDLE_ID,
    backgroundColor: '#ffffff',
    supportsTablet: true,
    infoPlist: IOS_INFO_PLIST,
    privacyManifests: IOS_PRIVACY_MANIFESTS,
  },
  android: {
    package: ENV.EXPO_PUBLIC_PACKAGE,
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './assets/images/adaptive-icon.png',
    },
    // No userInterfaceStyle override: the top-level "automatic" lets the system
    // dark setting reach the app's theme (a "light" override forced light mode).
  },
  locales: LOCALES,
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
    output: 'static',
  },
  plugins,
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: ENV.EAS_PROJECT_ID,
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: `https://u.expo.dev/${ENV.EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
  },
}, (mod) => {
  for (const [key, value] of Object.entries(GRADLE_BUILD_MEMORY)) {
    mod.modResults = mod.modResults.filter(item => !(item.type === 'property' && item.key === key));
    mod.modResults.push({ type: 'property', key, value });
  }
  return mod;
});
