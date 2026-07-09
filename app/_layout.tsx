import "react-native-url-polyfill/auto";
import "../global.css";
import "react-native-gesture-handler";

import { Toasts } from "@backpackapp-io/react-native-toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";
import { toastDefaultStyle } from "@/components/ui/Toast";
import { setupI18n } from "@/i18n";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useAuthStore, useOnboardingStore, useThemeStore } from "@/store";
import { isWeb } from "@/utils/platform";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
});

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner({ onReady }: { onReady: () => void }) {
  const readyRef = useRef(false);

  useEffect(() => {
    if (!readyRef.current) {
      readyRef.current = true;
      onReady();
    }
  }, [onReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);
  const themeMode = useThemeStore(s => s.mode);

  const hydrateAuth = useAuthStore(s => s.hydrate);
  const hydrateTheme = useThemeStore(s => s.hydrate);
  const hydrateOnboarding = useOnboardingStore(s => s.hydrate);

  const onReady = useCallback(() => {
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    setupI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (i18nReady && prefsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [i18nReady, prefsLoaded]);

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
    hydrateOnboarding();
  }, [hydrateAuth, hydrateTheme, hydrateOnboarding]);

  useEffect(() => {
    const bg = themeMode === "dark" ? "#000000" : "#ffffff";
    SystemUI.setBackgroundColorAsync(bg);
  }, [themeMode]);

  const isDark = themeMode === "dark";

  if (!i18nReady) {
    return (
      <ThemeProvider>
        <StatusBar style="auto" animated />
        <LottieView
          source={require("@assets/lottie/Loading animation blue.json")}
          autoPlay
          loop
          style={{ height: 70, width: 70 }}
        />
      </ThemeProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeaderButtonsProvider stackType={isWeb ? "js" : "native"}>
          <QueryProvider>
            <ThemeProvider>
              <BottomSheetModalProvider>
                <StatusBar style="auto" animated/>
                <RootLayoutInner onReady={onReady} />
                <Toasts
                  overrideDarkMode={isDark}
                  defaultStyle={toastDefaultStyle}
                  globalAnimationType="spring"
                  globalAnimationConfig={{
                    dampingRatio: 0.7,
                    duration: 250,
                    flingPositionReturnDuration: 200,
                  }}
                />
              </BottomSheetModalProvider>
              <PortalHost />
            </ThemeProvider>
          </QueryProvider>
        </HeaderButtonsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
