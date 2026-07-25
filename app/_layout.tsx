import { Toasts } from '@backpackapp-io/react-native-toast';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { PortalHost } from '@rn-primitives/portal';
import * as Font from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { ErrorBoundary as ExpoErrorBoundary, Stack } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';

import { AppProviders } from '@/components/layout/app-providers';
import { StartupScreen } from '@/components/layout/startup-screen';
import { setupI18n } from '@/i18n';
import {
  useAuthStore,
  useOnboardingStore,
  useThemeStore,
} from '@/store';
import { isAndroid } from '@/utils/platform';

import '../global.css';

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
  duration: 500,
});

function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const themeMode = useThemeStore(s => s.mode);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      Font.loadAsync({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
      }),
      setupI18n(),
      useAuthStore.getState().hydrate(),
      useThemeStore.getState().hydrate(),
      useOnboardingStore.getState().hydrate(),
    ])
      .catch((e) => {
        console.error('Startup Error:', e);
        if (mounted)
          setError(e as Error);
      })
      .then(() => {
        if (mounted) {
          setReady(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const isDark = themeMode === 'dark';
    const bg = isDark ? '#000000' : '#ffffff';

    SystemUI.setBackgroundColorAsync(bg).catch(() => {});

    if (isAndroid) {
      NavigationBar.setStyle(isDark ? 'light' : 'dark');
    }
  }, [themeMode]);

  if (!ready || error) {
    return (
      <StartupScreen
        appReady={ready}
        startupError={error}
      />
    );
  }

  return (
    <AppProviders>
      <StatusBar animated style="auto" />

      <Stack screenOptions={{ headerShown: false }} />

      <Toasts
        overrideDarkMode={themeMode === 'dark'}
        globalAnimationType="spring"
        globalAnimationConfig={{
          dampingRatio: 0.7,
          duration: 180,
        }}
      />

      <PortalHost />
    </AppProviders>
  );
}

// ✅ Attach instead of exporting (fixes Fast Refresh warning)
(RootLayout as any).ErrorBoundary = ExpoErrorBoundary;

export default RootLayout;
