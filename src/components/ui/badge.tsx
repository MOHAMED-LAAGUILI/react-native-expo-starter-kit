import type { LucideIcon } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/utils';
import { Icon } from './icon';
import { Text } from './text';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

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
};

const sizeStyles: Record<BadgeSize, string> = {
  lg: 'px-3 py-1.5',
  md: 'px-2.5 py-1',
  sm: 'px-1.5 py-0.5',
};

const textSizeStyles: Record<BadgeSize, string> = {
  lg: 'text-sm',
  md: 'text-xs',
  sm: 'text-[12px]',
};

const iconSizeStyles: Record<BadgeSize, number> = {
  lg: 14,
  md: 10,
  sm: 6,
};

function Badge({ variant = 'default', size = 'md', className, children, icon: IconComponent }: BadgeProps) {
  return (
    <View className={cn('flex-row items-center gap-1.5 self-start rounded-md', bgStyles[variant], sizeStyles[size], className)}>
      {IconComponent && (
        <Icon
          as={IconComponent}
          size={iconSizeStyles[size]}
          className={textStyles[variant]}
        />
      )}
      <Text className={cn('font-semibold', textStyles[variant], textSizeStyles[size])}>{children}</Text>
    </View>
  );
}

export type { BadgeProps, BadgeSize, BadgeVariant };
export { Badge };
