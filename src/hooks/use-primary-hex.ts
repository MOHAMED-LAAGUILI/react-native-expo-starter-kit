import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeStore } from '@/store/theme-store';

export const DEFAULT_PRIMARY_HEX = '#3b82f6';

export function usePrimaryHex(): string {
  const primaryKey = useThemeStore(s => s.primaryColor);
  return COLOR_PALETTES.find(p => p.key === primaryKey)?.color ?? DEFAULT_PRIMARY_HEX;
}
