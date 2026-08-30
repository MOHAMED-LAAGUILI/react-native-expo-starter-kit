import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeStore } from '@/store/theme-store';

export const DEFAULT_PRIMARY_HEX = '#3b82f6';

/** Precomputed lookup — avoids a linear scan on every render of every themed control. */
const PALETTE_HEX_MAP: Record<string, string> = Object.fromEntries(
  COLOR_PALETTES.map(p => [p.key, p.color]),
);

export function usePrimaryHex(): string {
  const primaryKey = useThemeStore(s => s.primaryColor);
  return PALETTE_HEX_MAP[primaryKey] ?? DEFAULT_PRIMARY_HEX;
}
