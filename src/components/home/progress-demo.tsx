import { ActivityIndicator, Platform, View } from 'react-native';
import { Progress, Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

function ProgressDemo() {
  const primaryHex = usePrimaryHex();
  const { muted } = useThemeColors();
  const isWeb = Platform.OS === 'web';

  return (
    <View className="border-border bg-card gap-5 rounded-xl border p-4">
      <View className="gap-2">
        <Text variant="caption" className="text-muted-foreground">Bar</Text>
        <Progress.Bar progress={0.3} width={200} color={primaryHex} unfilledColor={muted} />
      </View>

      <View className="flex-row items-center gap-8">
        <View className="items-center gap-2">
          {isWeb
            ? <WebProgressPie color={primaryHex} />
            : <Progress.Pie progress={0.4} size={50} color={primaryHex} />}
          <Text variant="caption" className="text-muted-foreground">Pie</Text>
        </View>
        <View className="items-center gap-2">
          {isWeb
            ? <ActivityIndicator color={primaryHex} size="small" />
            : <Progress.Circle size={30} indeterminate color={primaryHex} />}
          <Text variant="caption" className="text-muted-foreground">Loading</Text>
        </View>
        <View className="items-center gap-2">
          {isWeb
            ? <ActivityIndicator color={primaryHex} size="small" />
            : <Progress.CircleSnail color={[primaryHex, '#22c55e', '#f97316']} size={30} />}
          <Text variant="caption" className="text-muted-foreground">Snail</Text>
        </View>
      </View>
    </View>
  );
}

function WebProgressPie({ color }: { color: string }) {
  return (
    <View
      className="size-12 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <Text variant="caption" className="text-white">40%</Text>
    </View>
  );
}

export { ProgressDemo };
