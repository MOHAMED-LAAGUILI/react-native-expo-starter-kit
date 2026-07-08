import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { useEffect } from "react";
import { useAuthStore, useOnboardingStore } from "@/store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isOnboarded = useOnboardingStore(s => s.isComplete);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isOnboarded]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
