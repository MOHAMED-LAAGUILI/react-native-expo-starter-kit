import type * as React from 'react';
import type { ViewStyle } from 'react-native';
import * as TogglePrimitive from '@rn-primitives/toggle';
import { Platform } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { Text } from './text';

type ToggleVariant = 'default' | 'outline' | 'soft' | 'ghost';

type ToggleProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  variant?: ToggleVariant;
  className?: string;
  children: React.ReactNode;
};

function toRgbChannels(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full
    = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = toRgbChannels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastText(hex: string): string {
  const [r, g, b] = toRgbChannels(hex).map(c => c / 255);
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.4 ? '#18181b' : '#ffffff';
}

function resolveVariantStyle({
  variant,
  pressed,
  primaryHex,
  colors,
}: {
  variant: ToggleVariant;
  pressed: boolean;
  primaryHex: string;
  colors: ReturnType<typeof useThemeColors>;
}): ViewStyle {
  switch (variant) {
    case 'outline':
      return {
        backgroundColor: pressed ? primaryHex : 'transparent',
        borderColor: pressed ? primaryHex : colors.border,
        borderWidth: 1,
      };
    case 'soft':
      return {
        backgroundColor: pressed ? hexToRgba(primaryHex, 0.16) : 'transparent',
      };
    case 'ghost':
      return {
        backgroundColor: pressed ? hexToRgba(colors.text, 0.08) : 'transparent',
      };
    default:
      return {
        backgroundColor: pressed ? primaryHex : colors.border,
      };
  }
}

function Toggle({
  pressed,
  onPressedChange,
  disabled,
  variant = 'default',
  className,
  children,
}: ToggleProps) {
  const primaryHex = usePrimaryHex();
  const colors = useThemeColors();
  const onPrimary = getContrastText(primaryHex);
  const isSolid = variant === 'default' || variant === 'outline';
  const textColor = pressed && isSolid ? onPrimary : colors.text;

  return (
    <TogglePrimitive.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cn(
        'flex-row items-center gap-2 rounded-md px-3 py-2',
        disabled && 'opacity-50',
        Platform.select({
          web: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        }),
        className,
      )}
      style={resolveVariantStyle({ variant, pressed, primaryHex, colors })}
    >
      <Text className="text-base font-medium" style={{ color: textColor }}>
        {children}
      </Text>
    </TogglePrimitive.Root>
  );
}

export type { ToggleProps, ToggleVariant };
export { Toggle };
