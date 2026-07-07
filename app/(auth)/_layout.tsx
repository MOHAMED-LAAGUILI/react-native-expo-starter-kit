import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { useEffect } from "react";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";
import { useAuthStore } from "@/store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated]);

  const [onboardingComplete] = React.useState(() => StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE));

  useEffect(() => {
    if (!isAuthenticated && !onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, onboardingComplete]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
