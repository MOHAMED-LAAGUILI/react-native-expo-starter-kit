import { useUniwind } from 'uniwind';

export type ThemeColors = {
  background: string;
  border: string;
  card: string;
  destructive: string;
  icon: string;
  isDark: boolean;
  muted: string;
  text: string;
};

const LIGHT_COLORS: ThemeColors = {
  background: '#fff',
  border: '#d4d4d8',
  card: '#fff',
  destructive: '#dc2626',
  icon: '#000',
  isDark: false,
  muted: '#71717a',
  text: '#000',
};

const DARK_COLORS: ThemeColors = {
  background: '#000',
  border: '#3f3f46',
  card: '#18181b',
  destructive: '#ef4444',
  icon: '#fff',
  isDark: true,
  muted: '#a1a1aa',
  text: '#fff',
};

/**
 * Theme-aware hex colors for native APIs that can't take a className
 * (lucide `color`, `ActivityIndicator color`, SVG fills). Both palettes are
 * module constants, so the returned identity is already stable per theme.
 */
export function useThemeColors(): ThemeColors {
  const { theme } = useUniwind();
  return theme.startsWith('dark') ? DARK_COLORS : LIGHT_COLORS;
}
