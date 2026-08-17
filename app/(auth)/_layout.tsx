import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Blush } from '@/components/ui';
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
    return null;
  }

  return (
    <View className="flex-1 overflow-hidden bg-background">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
      </Stack>
      <Blush corner="top-left" />
      <Blush corner="bottom-right" />
    </View>
  );
}
