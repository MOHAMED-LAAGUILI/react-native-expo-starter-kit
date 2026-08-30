import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

/** Delay between successive charts becoming ready, so they mount one frame-budget at a time. */
const STAGGER_MS = 120;

/**
 * Defers chart mounting until after the current navigation/gesture
 * interactions finish (`InteractionManager`), then staggers siblings by
 * `order` so multiple charts never mount in the same frame.
 *
 * @param order 0-based position among sibling charts on the screen.
 */
export function useChartReady(order = 0) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(setReady, order * STAGGER_MS, true);
    });
    return () => {
      task.cancel();
      if (timer)
        clearTimeout(timer);
    };
  }, [order]);

  return ready;
}
