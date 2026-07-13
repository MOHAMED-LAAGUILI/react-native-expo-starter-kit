import type * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/utils/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
};

const bgStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground/15',
  destructive: 'bg-destructive',
  outline: 'bg-transparent border border-border',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
};

const textStyles: Record<BadgeVariant, string> = {
  default: 'text-muted-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
};

const sizeStyles: Record<BadgeSize, string> = {
  lg: 'px-3 py-1.5',
  md: 'px-2.5 py-1',
  sm: 'px-1.5 py-0.5',
};

const textSizeStyles: Record<BadgeSize, string> = {
  lg: 'text-sm',
  md: 'text-xs',
  sm: 'text-[10px]',
};

function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
  return (
    <View className={cn('self-start rounded-full', bgStyles[variant], sizeStyles[size], className)}>
      <Text className={cn('font-semibold', textStyles[variant], textSizeStyles[size])}>{children}</Text>
    </View>
  );
}

export type { BadgeProps, BadgeSize, BadgeVariant };
export { Badge };
