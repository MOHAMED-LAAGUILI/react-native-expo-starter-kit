import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { ChartSkeleton } from './chart-skeleton';
import { Text } from './text';

type ChartContainerLegendItem = {
  label: string;
  color: string;
  value?: string;
};

type ChartContainerProps = {
  title: string;
  subtitle?: string;
  legend?: ChartContainerLegendItem[];
  footer?: ReactNode;
  /** Swaps the body for a skeleton — used while staggered charts wait their turn to mount. */
  loading?: boolean;
  /** Height of the loading skeleton; should match the chart it stands in for. */
  height?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Framing for a single chart: heading, body, legend and optional footer.
 * Every chart on the report screen sits in one so they line up on any width.
 */
function ChartContainer({
  title,
  subtitle,
  legend,
  footer,
  loading,
  height = 220,
  className,
  children,
}: ChartContainerProps) {
  return (
    <View className={cn('border-border bg-card gap-3 rounded-2xl border p-4', className)}>
      <View className="flex-row items-center justify-between gap-3">
        <Text numberOfLines={1} className="flex-1 text-sm font-semibold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" numberOfLines={1} className="text-muted-foreground shrink-0">
            {subtitle}
          </Text>
        )}
      </View>

      {loading ? <ChartSkeleton height={height} /> : children}

      {legend != null && legend.length > 0 && (
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {legend.map(item => (
            <View key={item.label} className="flex-row items-center gap-2">
              <View
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text variant="caption" className="text-muted-foreground">
                {item.label}
              </Text>
              {item.value != null && (
                <Text variant="caption" className="font-semibold">
                  {item.value}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {footer}
    </View>
  );
}

export type { ChartContainerLegendItem, ChartContainerProps };
export { ChartContainer };
