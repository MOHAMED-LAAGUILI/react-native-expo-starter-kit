import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text } from '../ui/text';

export function StartupScreen({ appReady, startupError, loadingStep }: { appReady: boolean; startupError: Error | null; loadingStep: string }) {
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
