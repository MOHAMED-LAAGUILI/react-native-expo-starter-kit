import * as React from 'react';

/**
 * Returns a value that only updates after it has stopped changing for
 * `delayMs`. Use for search inputs and other rapid-fire state that feeds
 * expensive work (queries, filters) — the UI stays instant while the
 * consumer sees the settled value.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(setDebounced, delayMs, value);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
