import { useEffect, useState } from 'react';

/** Delay between successive charts becoming ready, so they mount one frame-budget at a time. */
const STAGGER_MS = 120;

/** Upper bound on how long to wait for an idle period before mounting anyway. */
const IDLE_TIMEOUT_MS = 500;

type IdleHandle = { cancel: () => void };

/**
 * Runs `cb` once the JS thread is idle. React Native 0.88 (Expo SDK 58)
 * removed `InteractionManager`; `requestIdleCallback` is its replacement.
 * Falls back to a macrotask where it is missing (older Safari on web) — or
 * where only half the pair exists, since a handle we can't cancel would fire
 * `setState` after unmount.
 */
function runWhenIdle(cb: () => void): IdleHandle {
  if (typeof requestIdleCallback === 'function' && typeof cancelIdleCallback === 'function') {
    // Bind the canceller now: the global may be swapped before cleanup runs.
    const cancelIdle = cancelIdleCallback;
    const id = requestIdleCallback(cb, { timeout: IDLE_TIMEOUT_MS });
    return { cancel: () => cancelIdle(id) };
  }
  const id = setTimeout(cb, 0);
  return { cancel: () => clearTimeout(id) };
}

/**
 * Defers chart mounting until the JS thread is idle (after the current
 * navigation/gesture work), then staggers siblings by `order` so multiple
 * charts never mount in the same frame.
 *
 * @param order 0-based position among sibling charts on the screen.
 */
export function useChartReady(order = 0) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = runWhenIdle(() => {
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
