import { ActivityIndicator, View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

function Loading() {
  const primaryHex = usePrimaryHex();

  return (
    <View className="bg-background flex-1 items-center justify-center gap-4">
      <ActivityIndicator size="large" color={primaryHex} />
    </View>
  );
}

export { Loading };
