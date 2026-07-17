import type { ReactNode } from 'react';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import * as Font from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HeaderButtonsProvider } from 'react-navigation-header-buttons/HeaderButtonsProvider';
import { withUniwind } from 'uniwind';
import { WebErrorBoundary } from '@/components/common/web-error-boundary';
import { Text } from '@/components/ui';
import { setupI18n } from '@/i18n';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import {
  useAuthStore,
  useOnboardingStore,
  useThemeStore,
} from '@/store';
import { isAndroid, isWeb } from '@/utils/platform';
import '../global.css';

const StyledSafeAreaView = withUniwind(SafeAreaView);

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

function StartupScreen({ appReady, startupError, loadingStep }: { appReady: boolean; startupError: Error | null; loadingStep: string }) {
  if (appReady && !startupError)
    return null;

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-6 text-xl font-bold">
        {startupError && 'Startup Failed'}
      </Text>
      <Text className="mt-2 text-center text-muted-foreground">{loadingStep}</Text>
      {startupError && (
        <ScrollView className="mt-8 max-h-[55%] w-full rounded-xl border border-destructive bg-destructive/10 p-4">
          <Text className="font-bold text-destructive">{startupError.name}</Text>
          <Text selectable className="mt-2">{startupError.message}</Text>
          {!!startupError.stack && (
            <>
              <Text className="mt-4 font-bold">Stack Trace</Text>
              <Text selectable className="mt-2 text-xs">{startupError.stack}</Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <StyledSafeAreaView className="flex-1 bg-background">
          <HeaderButtonsProvider stackType={isWeb ? 'js' : 'native'}>
            <QueryProvider>
              <BottomSheetModalProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </BottomSheetModalProvider>
            </QueryProvider>
          </HeaderButtonsProvider>
        </StyledSafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

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
