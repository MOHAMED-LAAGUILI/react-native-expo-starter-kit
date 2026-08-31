import type { LayoutChangeEvent } from 'react-native';
import { useState } from 'react';

/**
 * Measures the container a chart renders into. gifted-charts needs an explicit
 * pixel `width`, so charts stay unmounted until the first layout pass reports one.
 *
 * @param onLayout Optional passthrough for a caller that also needs the event.
 */
export function useChartWidth(onLayout?: (event: LayoutChangeEvent) => void) {
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.floor(event.nativeEvent.layout.width);
    setChartWidth(current => (current === width ? current : width));
    onLayout?.(event);
  };

  return { chartWidth, handleLayout };
}
