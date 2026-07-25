import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';

function TestScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      contentInset={{ bottom: insets.bottom }}
    >
      <View className="gap-8 p-6">
        <Text variant="h2">Test Page</Text>

      </View>
    </ScrollView>
  );
}

export { TestScreen };
