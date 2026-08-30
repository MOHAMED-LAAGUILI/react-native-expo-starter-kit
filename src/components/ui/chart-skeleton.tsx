import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { Skeleton } from './skeleton';

type ChartSkeletonProps = {
  height?: number;
  className?: string;
};

function ChartSkeleton({ height = 200, className }: ChartSkeletonProps) {
  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      style={{ height }}
    >
      <Skeleton className="size-full rounded-xl" />
    </View>
  );
}

type ChartSkeletonListProps = {
  rows?: number;
};

const ROW_KEYS = [0, 1, 2, 3, 4];

function ChartSkeletonList({ rows = 3 }: ChartSkeletonListProps) {
  const rowKeys = ROW_KEYS.slice(0, rows);

  return (
    <View className="gap-3">
      {rowKeys.map(rowKey => (
        <View key={rowKey} className="gap-2">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-3 w-2/3" />
            </View>
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </View>
          <Skeleton className="h-2 w-full" />
        </View>
      ))}
    </View>
  );
}

export { ChartSkeleton, ChartSkeletonList };
