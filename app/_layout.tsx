import { Toasts } from '@backpackapp-io/react-native-toast';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PortalHost } from '@rn-primitives/portal';
import * as Font from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { ObserveRoot } from 'expo-observe';
import { Stack } from 'expo-router';
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

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
  duration: 500,
});

function RootLayout() {
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
        setLoadingStep('Initializing application...');
        await Promise.all([
          Font.loadAsync({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold }),
          setupI18n(),
          Promise.resolve(hydrateAuth()),
          Promise.resolve(hydrateTheme()),
          Promise.resolve(hydrateOnboarding()),
        ]);
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
            <>
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
            </>
          )}
    </AppProviders>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default ObserveRoot.wrap(RootLayout);
