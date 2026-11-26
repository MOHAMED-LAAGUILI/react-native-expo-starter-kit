import { act, renderHook } from '@testing-library/react-native';
import { useChartReady } from '@/hooks/use-chart-ready';

describe('useChartReady', () => {
  const realIdle = globalThis.requestIdleCallback;
  const realCancel = globalThis.cancelIdleCallback;

  beforeEach(() => {
    jest.useFakeTimers();
    // Deterministic "idle": the next macrotask. The RN Jest env ships its own
    // requestIdleCallback whose timing is an implementation detail.
    globalThis.requestIdleCallback = (cb => setTimeout(cb, 0) as unknown as number) as typeof requestIdleCallback;
    globalThis.cancelIdleCallback = (id => clearTimeout(id)) as typeof cancelIdleCallback;
  });

  afterEach(() => {
    jest.useRealTimers();
    globalThis.requestIdleCallback = realIdle;
    globalThis.cancelIdleCallback = realCancel;
  });

  it('starts not ready, then becomes ready once the JS thread is idle', async () => {
    const { result } = await renderHook(() => useChartReady(0));
    expect(result.current).toBe(false);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current).toBe(true);
  });

  it('staggers later charts by their order', async () => {
    const first = await renderHook(() => useChartReady(0));
    const third = await renderHook(() => useChartReady(2));

    // Once idle, the first chart is ready; the third waits another 2 × 120 ms.
    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    expect(first.result.current).toBe(true);
    expect(third.result.current).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    expect(third.result.current).toBe(true);
  });

  it('cancels pending work on unmount', async () => {
    const { unmount } = await renderHook(() => useChartReady(1));
    await act(async () => {
      unmount();
    });
    expect(() => jest.runOnlyPendingTimers()).not.toThrow();
  });
});
