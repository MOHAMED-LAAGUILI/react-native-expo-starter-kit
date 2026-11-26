import { View } from 'react-native';
import { Progress, Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

function ProgressDemo() {
  const primaryHex = usePrimaryHex();
  const { muted } = useThemeColors();

  return (
    <View className="border-border bg-card gap-5 rounded-xl border p-4">
      <View className="gap-2">
        <Text variant="caption" className="text-muted-foreground">Bar</Text>
        <Progress.Bar progress={0.3} width={200} color={primaryHex} unfilledColor={muted} />
      </View>

      <View className="flex-row items-center gap-8">
        <View className="items-center gap-2">
          <Progress.Pie progress={0.4} size={50} color={primaryHex} />
          <Text variant="caption" className="text-muted-foreground">Pie</Text>
        </View>
        <View className="items-center gap-2">
          <Progress.Circle progress={0.7} size={30} color={primaryHex} unfilledColor={muted} />
          <Text variant="caption" className="text-muted-foreground">Ring</Text>
        </View>
        <View className="items-center gap-2">
          <Progress.Circle size={30} indeterminate color={primaryHex} />
          <Text variant="caption" className="text-muted-foreground">Loading</Text>
        </View>
        <View className="items-center gap-2">
          <Progress.CircleSnail color={[primaryHex, '#22c55e', '#f97316']} size={30} />
          <Text variant="caption" className="text-muted-foreground">Snail</Text>
        </View>
      </View>
    </View>
  );
}

export { ProgressDemo };
