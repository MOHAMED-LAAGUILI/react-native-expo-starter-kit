import { chartItemKey, getAxisColor, getTrackColor, niceAxisMax } from '@/utils/chart';

describe('niceAxisMax', () => {
  it.each([
    [0, 1],
    [-5, 1],
    [7, 7],
    [42, 50],
    [101, 200],
    [0.34, 0.4],
    [9999, 10000],
  ])('rounds %p up to %p', (value, expected) => {
    expect(niceAxisMax(value)).toBeCloseTo(expected);
  });

  it('never returns less than the input', () => {
    for (const value of [1, 3, 17, 250, 1234, 98765])
      expect(niceAxisMax(value)).toBeGreaterThanOrEqual(value);
  });
});

describe('chart colours', () => {
  it('uses a darker axis and track in dark mode', () => {
    expect(getAxisColor(true)).not.toBe(getAxisColor(false));
    expect(getTrackColor(true)).not.toBe(getTrackColor(false));
  });
});

describe('chartItemKey', () => {
  it('is stable for the same item and distinct for different ones', () => {
    const item = { label: 'Design', value: 12, color: '#3b82f6' };
    expect(chartItemKey(item)).toBe(chartItemKey({ ...item }));
    expect(chartItemKey(item)).not.toBe(chartItemKey({ ...item, value: 13 }));
  });

  it('falls back to a generic label', () => {
    expect(chartItemKey({ value: 1, color: '#000' })).toBe('item-1-#000');
  });
});
