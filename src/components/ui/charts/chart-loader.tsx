import type { ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { useChartReady } from '@/hooks/use-chart-ready';
import { ChartPreloader } from './chart-preloader';

type ChartLoaderProps = {
  children: ReactNode;
  delay?: number;
  minHeight?: number;
  round?: boolean;
  label?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

function ChartLoader({
  children,
  delay = 120,
  minHeight,
  round = false,
  label,
  onLayout,
}: ChartLoaderProps) {
  const requiresLayout = onLayout != null;
  const { ready, onLayout: onReadyLayout } = useChartReady({ delay, requiresLayout });

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (requiresLayout) {
      onReadyLayout();
    }
  };

  if (ready) {
    return (
      <Animated.View
        entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
        onLayout={requiresLayout ? handleLayout : undefined}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View onLayout={requiresLayout ? handleLayout : undefined}>
      <ChartPreloader minHeight={minHeight} round={round} label={label} />
    </View>
  );
}

export { ChartLoader };
export type { ChartLoaderProps };
