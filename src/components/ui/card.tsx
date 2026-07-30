import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { cn } from '@/utils/utils';
import { Text } from './text';

type CardVariant = 'primary' | 'secondary' | 'stats' | 'compact' | 'action';

type CardProps = {
  variant?: CardVariant;
  title: string;
  value?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
};

function Card({
  variant = 'stats',
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  children,
}: CardProps) {
  const primaryHex = usePrimaryHex();

  const isLightSolid = variant === 'primary';
  const iconBg = isLightSolid ? 'rgba(255,255,255,0.2)' : `${primaryHex}15`;
  const iconColor = isLightSolid ? '#fff' : primaryHex;

  return (
    <View
      className={cn(
        'border-border overflow-hidden rounded-2xl border',
        isLightSolid && 'border-transparent',
        variant === 'secondary' && 'border-transparent',
        variant === 'stats' && 'bg-card',
        variant === 'compact' && 'bg-card',
        variant === 'action' && 'bg-card',
        className,
      )}
      style={variant === 'primary' ? { backgroundColor: primaryHex } : undefined}
    >
      <View className={cn('p-4', variant === 'compact' && 'p-3')}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text
              variant="caption"
              className={cn(isLightSolid ? 'text-white/70' : 'text-muted-foreground')}
            >
              {title}
            </Text>
            {value && (
              <Text
                variant="h2"
                className={cn(
                  'tracking-tight',
                  isLightSolid ? 'text-white' : 'text-foreground',
                  variant === 'compact' && 'text-2xl',
                )}
              >
                {value}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="caption"
                className={cn(isLightSolid ? 'text-white/60' : 'text-muted-foreground')}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {Icon && (
            <View
              className="ml-3 items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, backgroundColor: iconBg }}
            >
              <Icon size={22} color={iconColor} />
            </View>
          )}
        </View>
        {children}
      </View>
    </View>
  );
}

export type { CardProps, CardVariant };
export { Card };
