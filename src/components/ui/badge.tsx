import type { LucideIcon } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { GlassView } from './glass-view';
import { Icon } from './icon';
import { Text } from './text';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'glass';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
};

const bgStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground/15',
  destructive: 'bg-destructive',
  outline: 'bg-transparent border border-primary',
  primary: 'bg-primary',
  secondary: 'bg-primary/20',
  success: 'bg-green-600 dark:bg-green-700',
  warning: 'bg-yellow-600 dark:bg-yellow-700',
  info: 'bg-blue-600 dark:bg-blue-700',
  glass: 'bg-transparent',
};

const textStyles: Record<BadgeVariant, string> = {
  default: 'text-muted-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-primary',
  primary: 'text-primary-foreground',
  secondary: 'text-primary',
  success: 'text-white',
  warning: 'text-white',
  info: 'text-white',
  glass: 'text-foreground',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1 py-0.5',
  lg: 'px-3 py-1.5',
  md: 'px-2.5 py-1',
  sm: 'px-1.5 py-0.5',
};

const textSizeStyles: Record<BadgeSize, string> = {
  xs: 'text-[10px]',
  lg: 'text-sm',
  md: 'text-xs',
  sm: 'text-[12px]',
};

const iconSizeStyles: Record<BadgeSize, number> = {
  xs: 10,
  lg: 16,
  md: 14,
  sm: 12,
};

function BadgeContent({ variant, size, children, icon: IconComponent }: Pick<BadgeProps, 'children' | 'icon'> & { variant: BadgeVariant; size: BadgeSize }) {
  return (
    <>
      {IconComponent && (
        <Icon
          as={IconComponent}
          size={iconSizeStyles[size]}
          className={textStyles[variant]}
        />
      )}
      <Text className={cn('font-semibold', textStyles[variant], textSizeStyles[size])}>{children}</Text>
    </>
  );
}

function Badge({ variant = 'default', size = 'md', className, children, icon: IconComponent }: BadgeProps) {
  // Native BlurViews can paint over absolutely-positioned siblings, so glass
  // badges render their content as GlassView children (always above the blur).
  if (variant === 'glass') {
    return (
      <GlassView
        intensity="subtle"
        className={cn('flex-row items-center gap-1.5 self-start rounded-md', sizeStyles[size], className)}
      >
        <BadgeContent variant={variant} size={size} icon={IconComponent}>{children}</BadgeContent>
      </GlassView>
    );
  }

  return (
    <View className={cn('flex-row items-center gap-1.5 self-start overflow-hidden rounded-md', bgStyles[variant], sizeStyles[size], className)}>
      <BadgeContent variant={variant} size={size} icon={IconComponent}>{children}</BadgeContent>
    </View>
  );
}

export type { BadgeProps, BadgeSize, BadgeVariant };
export { Badge };
