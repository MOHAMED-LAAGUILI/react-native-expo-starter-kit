import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

type ChartPreloaderProps = {
  minHeight?: number;
  round?: boolean;
  label?: string;
};

function ChartPreloader({
  minHeight = 220,
  round = false,
  label = 'Loading chart…',
}: ChartPreloaderProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{ minHeight }}
      className="items-center justify-center gap-3"
    >
      {round
        ? <Skeleton className="size-44 rounded-full" />
        : <Skeleton className="h-44 w-full rounded-lg" />}
      <Text variant="caption" className="text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

export { ChartPreloader };
export type { ChartPreloaderProps };
