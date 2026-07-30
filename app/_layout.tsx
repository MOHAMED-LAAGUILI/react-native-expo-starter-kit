import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { PortalHost } from '@rn-primitives/portal';
import * as Font from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { ErrorBoundary as ExpoErrorBoundary, Stack, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ToastContainer } from 'react-native-toast-message-ts';

import { AppProviders } from '@/components/layout/app-providers';
import { Text } from '@/components/ui';
import { setupI18n } from '@/i18n';
import {
  useAuthStore,
  useOnboardingStore,
  useThemeStore,
} from '@/store';
import { isAndroid } from '@/utils/platform';

import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigationState = useRootNavigationState();
  const navigationReady = navigationState?.key !== undefined;

  const themeMode = useThemeStore(s => s.mode);

  useEffect(() => {
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
        setError(e as Error);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    if (isReady && navigationReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady, navigationReady]);

  useEffect(() => {
    const isDark = themeMode === 'dark';
    const bg = isDark ? '#000000' : '#ffffff';

    SystemUI.setBackgroundColorAsync(bg).catch(() => {});

    if (isAndroid) {
      NavigationBar.setStyle(isDark ? 'light' : 'dark');
    }
  }, [themeMode]);

  if (!isReady) {
    return null;
  }

  if (error) {
    return (
      <AppProviders>
        <View className="flex-1 items-center justify-center bg-background p-8">
          <Text variant="h3" className="text-destructive">Startup Error</Text>
          <Text variant="body" className="text-muted-foreground mt-2 text-center">
            {error.message}
          </Text>
        </View>
      </AppProviders>
    );
  }

  return (
    <AppProviders>
      <StatusBar animated style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastContainer />
      <PortalHost />
    </AppProviders>
  );
}

(RootLayout as any).ErrorBoundary = ExpoErrorBoundary;
