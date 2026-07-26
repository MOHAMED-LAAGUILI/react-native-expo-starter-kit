import type { LucideIcon } from 'lucide-react-native';
import type { PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Icon } from './icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'primary-gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
  leftIcon?: (color: string) => React.ReactNode;
  rightIcon?: (color: string) => React.ReactNode;
  leftIconComponent?: LucideIcon;
  rightIconComponent?: LucideIcon;
} & PressableProps;

const SHADOW_COLORS: Record<string, string | undefined> = {
  'primary': undefined,
  'primary-gradient': undefined,
  'destructive': '#ef4444',
  'success': '#16a34a',
};

const BG_CLASS: Record<string, string> = {
  'primary': 'bg-primary active:bg-primary/90',
  'primary-gradient': 'bg-transparent',
  'secondary': 'bg-primary/10 active:bg-primary/20',
  'outline': 'border border-primary bg-background active:bg-primary/10',
  'ghost': 'active:bg-accent',
  'destructive': 'bg-destructive active:bg-destructive/90',
  'success': 'bg-green-600 active:bg-green-700',
};

const TEXT_CLASS: Record<string, string> = {
  'primary': 'text-white!',
  'primary-gradient': 'text-white',
  'secondary': 'text-primary',
  'outline': 'text-primary',
  'ghost': 'text-foreground',
  'destructive': 'text-destructive-foreground',
  'success': 'text-white',
};

const ICON_CLASS: Record<string, string> = {
  'primary': 'text-primary-foreground',
  'primary-gradient': 'text-white',
  'secondary': 'text-primary',
  'outline': 'text-primary',
  'ghost': 'text-foreground',
  'destructive': 'text-destructive-foreground',
  'success': 'text-white',
};

function GradientBackground({
  variant,
  primaryHex,
}: {
  variant: string;
  primaryHex: string;
}) {
  if (variant !== 'primary-gradient')
    return null;
  return (
    <LinearGradient
      colors={[primaryHex, `${primaryHex}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
    />
  );
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  title,
  leftIcon,
  rightIcon,
  leftIconComponent,
  rightIconComponent,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const primaryHex = usePrimaryHex();
  const { isDark } = useThemeColors();

  const isLightStyle = variant === 'primary' || variant === 'primary-gradient' || variant === 'destructive' || variant === 'success';

  const shadowColor = variant === 'primary' || variant === 'primary-gradient' ? primaryHex : SHADOW_COLORS[variant];

  const shadowStyle = !disabled && shadowColor
    ? {
        elevation: 6,
        shadowColor,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      }
    : undefined;

  const iconColor = isLightStyle
    ? '#fff'
    : variant === 'secondary' || variant === 'outline'
      ? primaryHex
      : isDark
        ? '#fff'
        : '#000';

  const iconClassName = cn(
    size === 'sm' && 'size-4',
    size !== 'sm' && 'size-5',
    ICON_CLASS[variant],
  );

  const bgClass = BG_CLASS[variant];
  const textClass = TEXT_CLASS[variant];

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg',
        size === 'sm' && 'h-9 px-3',
        size === 'md' && 'h-11 px-6',
        size === 'lg' && 'h-12 px-8',
        bgClass,
        disabled && 'opacity-50',
        pressed && !disabled && 'opacity-80',
        className,
      )}
      style={shadowStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      {...props}
    >
      <GradientBackground {...{ variant, primaryHex }} />
      {loading
        ? (
            <ActivityIndicator
              size="small"
              color={isLightStyle ? '#ffffff' : undefined}
            />
          )
        : (
            <>
              {leftIconComponent
                ? <Icon as={leftIconComponent} className={iconClassName} color={iconColor} />
                : leftIcon?.(iconColor)}
              <Text
                className={cn(
                  'font-semibold',
                  textClass,
                  size === 'sm' && 'text-sm',
                  size === 'md' && 'text-base',
                  size === 'lg' && 'text-lg',
                )}
              >
                {title}
              </Text>
              {rightIconComponent
                ? <Icon as={rightIconComponent} className={iconClassName} color={iconColor} />
                : rightIcon?.(iconColor)}
            </>
          )}
    </Pressable>
  );
}

export type { ButtonProps, ButtonSize, ButtonVariant };
export { Button };
