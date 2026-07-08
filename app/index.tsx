import { Redirect } from "expo-router";
import * as React from "react";
import { useAuthStore, useOnboardingStore } from "@/store";

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isOnboarded = useOnboardingStore(s => s.isComplete);

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
