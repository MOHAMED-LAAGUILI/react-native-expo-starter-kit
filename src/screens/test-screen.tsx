import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TestScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={{ bottom: insets.bottom + 24 }}
    >
      <View className="gap-6 p-6">

      </View>
    </ScrollView>
  );
}
