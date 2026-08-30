import type { BlurViewProps } from 'expo-blur';
import { BlurView } from 'expo-blur';
import * as React from 'react';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';

type GlassIntensity = 'subtle' | 'medium' | 'strong';
type GlassTint = 'auto' | 'light' | 'dark';

type GlassViewProps = {
  /** Blur strength preset, or a raw 1–100 number. @default 'medium' */
  intensity?: GlassIntensity | number;
  /** Blur tint. 'auto' follows the active theme. @default 'auto' */
  tint?: GlassTint;
  /** Render the frosted hairline border. @default true */
  bordered?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<BlurViewProps, 'intensity' | 'tint' | 'blurMethod'>;

const INTENSITY_MAP: Record<GlassIntensity, number> = {
  medium: 50,
  strong: 80,
  subtle: 25,
};

const StyledBlurView = withUniwind(BlurView);

/**
 * iOS-style frosted glass surface that renders on all three platforms:
 * native UIVisualEffectView on iOS, Dimezis BlurView on Android, and CSS
 * `backdrop-filter` on web — all through `expo-blur`.
 *
 * A translucent wash + hairline border are layered on top of the blur so the
 * glass reads consistently even over low-contrast content. Round it with
 * `rounded-*` classes; overflow is clipped automatically.
 *
 * @example
 * <GlassView intensity="strong" className="rounded-2xl p-4">…</GlassView>
 */
function GlassView({
  intensity = 'medium',
  tint = 'auto',
  bordered = true,
  className,
  children,
  ...props
}: GlassViewProps) {
  const { isDark } = useThemeColors();

  const resolvedTint = tint === 'auto' ? (isDark ? 'dark' : 'light') : tint;
  const resolvedIntensity = typeof intensity === 'number' ? intensity : INTENSITY_MAP[intensity];
  const darkGlass = resolvedTint === 'dark';

  return (
    <StyledBlurView
      intensity={resolvedIntensity}
      tint={resolvedTint}
      blurMethod="dimezisBlurView"
      className={cn(
        'overflow-hidden',
        bordered && 'border',
        bordered && (darkGlass ? 'border-white/10' : 'border-white/40'),
        className,
      )}
      {...props}
    >
      <View
        pointerEvents="none"
        className={cn('absolute inset-0', darkGlass ? 'bg-white/5' : 'bg-white/30')}
      />
      {children}
    </StyledBlurView>
  );
}

export type { GlassIntensity, GlassTint, GlassViewProps };
export { GlassView };
