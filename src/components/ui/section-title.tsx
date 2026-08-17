import type { TextVariant } from './text';
import { View } from 'react-native';
import { Text } from './text';

function SectionTitle({ title, variant = 'h3' }: { title: string; variant?: TextVariant | undefined | string }) {
  return (
    <View className="mt-6 mb-3 first:mt-0">
      <Text variant={variant}>{title}</Text>
      <View className="bg-border mt-2 h-px" />
    </View>
  );
}

export { SectionTitle };
