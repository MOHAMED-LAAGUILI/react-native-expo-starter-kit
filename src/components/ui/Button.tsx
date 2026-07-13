import type { PressableProps } from 'react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/utils/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
  leftIcon?: (color: string) => React.ReactNode;
  rightIcon?: (color: string) => React.ReactNode;
} & PressableProps;

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  title,
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const primaryKey = useThemeStore(s => s.primaryColor);
  const primaryHex = React.useMemo(() => COLOR_PALETTES.find(p => p.key === primaryKey)?.color ?? '#3b82f6', [primaryKey]);

  const iconColor = variant === 'primary' || variant === 'destructive' ? '#fff' : primaryHex;

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg',
        size === 'sm' && 'h-9 px-3',
        size === 'md' && 'h-11 px-6',
        size === 'lg' && 'h-12 px-8',
        variant === 'primary' && 'bg-primary active:bg-primary/90',
        variant === 'secondary' && 'bg-primary/10 active:bg-primary/20',
        variant === 'outline' && 'border border-primary bg-background active:bg-primary/10',
        variant === 'ghost' && 'active:bg-accent',
        variant === 'destructive' && 'bg-destructive active:bg-destructive/90',
        disabled && 'opacity-50',
        pressed && !disabled && 'opacity-80',
        className,
      )}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? (
            <ActivityIndicator
              size="small"
              color={variant === 'primary' || variant === 'destructive' ? '#ffffff' : undefined}
            />
          )
        : (
            <>
              {leftIcon?.(iconColor)}
              <Text
                className={cn(
                  'font-semibold',
                  variant === 'primary' && 'text-primary-foreground dark:text-white',
                  variant === 'secondary' && 'text-primary',
                  variant === 'outline' && 'text-primary',
                  variant === 'ghost' && 'text-foreground',
                  variant === 'destructive' && 'text-destructive-foreground',
                  size === 'sm' && 'text-sm',
                  size === 'md' && 'text-base',
                  size === 'lg' && 'text-lg',
                )}
              >
                {title}
              </Text>
              {rightIcon?.(iconColor)}
            </>
          )}
    </Pressable>
  );
}

export type { ButtonProps, ButtonSize, ButtonVariant };
export { Button };
