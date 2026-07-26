import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore, useOnboardingStore } from '@/store';

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isOnboarded = useOnboardingStore(s => s.isComplete);

  const target = !isOnboarded
    ? '/onboarding'
    : isAuthenticated
      ? '/(app)/(tabs)'
      : '/(auth)/login';

  return (
    <View className="flex-1 bg-background">
      <Redirect href={target} />
    </View>
  );
}
