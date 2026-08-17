import { useEffect, useState } from 'react';

type UseChartReadyOptions = {
  delay?: number;
  requiresLayout?: boolean;
};

function useChartReady({
  delay = 120,
  requiresLayout = false,
}: UseChartReadyOptions = {}) {
  const [hasLaidOut, setHasLaidOut] = useState(!requiresLayout);
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(setDelayElapsed, delay, true);
    return () => clearTimeout(timer);
  }, [delay]);

  const onLayout = () => {
    setHasLaidOut(true);
  };

  return {
    ready: hasLaidOut && delayElapsed,
    onLayout,
  };
}

export { useChartReady };
export type { UseChartReadyOptions };
