import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';

export function ExpoUiScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        <Text variant="h1">ExpoUi</Text>

      </View>
    </ScrollView>
  );
}
