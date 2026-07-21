import * as ProgressPrimitive from '@rn-primitives/progress';
import * as React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { cn } from '@/utils/utils';

type ProgressProps = {
  value: number;
  className?: string;
};

function Progress({ value, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const progress = useSharedValue(clamped / 100);
  const barWidth = useSharedValue(0);

  React.useEffect(() => {
    progress.set(withTiming(clamped / 100, { duration: 300 }));
  }, [clamped, progress]);

  const indicatorStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      transform: [
        { scaleX: p },
        { translateX: -(1 - p) * barWidth.get() * 0.5 },
      ],
    };
  });

  return (
    <ProgressPrimitive.Root
      className={cn('h-2 overflow-hidden rounded-full bg-border', className)}
      onLayout={(e) => { barWidth.set(e.nativeEvent.layout.width); }}
    >
      <ProgressPrimitive.Indicator asChild>
        <Animated.View
          className="size-full rounded-full bg-primary"
          style={indicatorStyle}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export type { ProgressProps };
export { Progress };
