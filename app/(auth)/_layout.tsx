import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore, useOnboardingStore } from '@/store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isOnboarded = useOnboardingStore(s => s.isComplete);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!(isAuthenticated || isOnboarded)) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isOnboarded, router]);

  if (isAuthenticated) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
