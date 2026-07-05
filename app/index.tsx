import * as React from "react";
import { Redirect } from "expo-router";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";
import { useAuthStore } from "@/store";

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [onboardingComplete] = React.useState(() =>
    StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE)
  );

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
