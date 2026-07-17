import { Toasts } from '@backpackapp-io/react-native-toast';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PortalHost } from '@rn-primitives/portal';
import * as Font from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import { WebErrorBoundary } from '@/components/common/web-error-boundary';
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

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
  duration: 600,
});

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Starting...');
  const [startupError, setStartupError] = useState<Error | null>(null);
  const themeMode = useThemeStore(s => s.mode);
  const hydrateAuth = useAuthStore(s => s.hydrate);
  const hydrateTheme = useThemeStore(s => s.hydrate);
  const hydrateOnboarding = useOnboardingStore(s => s.hydrate);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        setLoadingStep('Loading fonts...');
        await Font.loadAsync({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

        setLoadingStep('Initializing i18n...');
        await setupI18n();

        setLoadingStep('Hydrating authentication...');
        await Promise.resolve(hydrateAuth());

        setLoadingStep('Hydrating theme...');
        await Promise.resolve(hydrateTheme());

        setLoadingStep('Hydrating onboarding...');
        await Promise.resolve(hydrateOnboarding());

        setLoadingStep('Finalizing startup...');
      }
      catch (error) {
        console.error('Startup Error:', error);

        if (mounted) {
          setStartupError(error as Error);
        }
      }

      if (mounted) {
        setAppReady(true);

        try {
          await SplashScreen.hideAsync();
        }
        catch (error) {
          console.warn(error);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [hydrateAuth, hydrateTheme, hydrateOnboarding]);

  useEffect(() => {
    const bg = themeMode === 'dark' ? '#000000' : '#ffffff';

    SystemUI.setBackgroundColorAsync(bg).catch(console.warn);
  }, [themeMode]);

  useEffect(() => {
    if (isAndroid) {
      NavigationBar.setStyle(themeMode === 'dark' ? 'light' : 'dark');
    }
  }, [themeMode]);

  return (
    <AppProviders>
      <StatusBar
        animated
        style="auto"
        hidden={false}
      />

      {(!appReady || startupError)
        ? (
            <StartupScreen appReady={appReady} startupError={startupError} loadingStep={loadingStep} />
          )
        : (
            <WebErrorBoundary>
              <Stack screenOptions={{ headerShown: false }} />

              <Toasts
                overrideDarkMode={themeMode === 'dark'}
                globalAnimationType="spring"
                globalAnimationConfig={{
                  dampingRatio: 0.7,
                  duration: 200,
                  flingPositionReturnDuration: 200,
                }}
              />

              <PortalHost />
            </WebErrorBoundary>
          )}
    </AppProviders>
  );
}
