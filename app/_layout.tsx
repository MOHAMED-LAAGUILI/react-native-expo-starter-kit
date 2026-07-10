import { Toasts } from '@backpackapp-io/react-native-toast';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderButtonsProvider } from 'react-navigation-header-buttons/HeaderButtonsProvider';
import { toastDefaultStyle } from '@/components/ui/toast';
import { setupI18n } from '@/i18n';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { useAuthStore, useOnboardingStore, useThemeStore } from '@/store';
import { isWeb } from '@/utils/platform';
import 'react-native-url-polyfill/auto';
import '../global.css';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner({ hidden }: { hidden: boolean }) {
  const readyRef = useRef(false);

  useEffect(() => {
    if (!(readyRef.current || hidden)) {
      readyRef.current = true;
      SplashScreen.hideAsync();
    }
  }, [hidden]);

  if (hidden) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function SplashLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <LottieView
        source={require('@assets/lottie/loading_animation_blue.json')}
        autoPlay
        loop
        style={{ height: 70, width: 70 }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const themeMode = useThemeStore((s: { mode: any }) => s.mode);

  const hydrateAuth = useAuthStore((s: { hydrate: any }) => s.hydrate);
  const hydrateTheme = useThemeStore((s: { hydrate: any }) => s.hydrate);
  const hydrateOnboarding = useOnboardingStore((s: { hydrate: any }) => s.hydrate);

  useEffect(() => {
    setupI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
    hydrateOnboarding();
  }, [hydrateAuth, hydrateTheme, hydrateOnboarding]);

  useEffect(() => {
    const bg = themeMode === 'dark' ? '#000000' : '#ffffff';
    SystemUI.setBackgroundColorAsync(bg);
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeaderButtonsProvider stackType={isWeb ? 'js' : 'native'}>
          <QueryProvider>
            <BottomSheetModalProvider>
              <ThemeProvider>
                <StatusBar
                  style="auto"
                  animated
                />
                {!i18nReady && <SplashLoading />}
                <RootLayoutInner hidden={!i18nReady} />
                <Toasts
                  overrideDarkMode={isDark}
                  defaultStyle={toastDefaultStyle}
                  globalAnimationType="spring"
                  globalAnimationConfig={{
                    dampingRatio: 0.7,
                    duration: 200,
                    flingPositionReturnDuration: 200,
                  }}
                />
                <PortalHost />
              </ThemeProvider>
            </BottomSheetModalProvider>
          </QueryProvider>
        </HeaderButtonsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
