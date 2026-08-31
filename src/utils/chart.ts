/** Stable list key for a chart item, built from its own data rather than the array index. */
export function chartItemKey(item: { label?: string; value: number; color: string }) {
  return `${item.label ?? 'item'}-${item.value}-${item.color}`;
}

/** Grid and axis line colour that stays readable against either theme background. */
export function getAxisColor(isDark: boolean) {
  return isDark ? '#404040' : '#e5e5e5';
}

/** Neutral fill for the unfilled part of a radial track or progress ring. */
export function getTrackColor(isDark: boolean) {
  return isDark ? '#262626' : '#f1f1f1';
}

/**
 * Rounds a maximum up to a readable axis bound, so ticks land on round numbers
 * instead of on whatever the largest data point happens to be.
 */
export function niceAxisMax(value: number) {
  if (value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));

  return Math.ceil(value / magnitude) * magnitude;
}
