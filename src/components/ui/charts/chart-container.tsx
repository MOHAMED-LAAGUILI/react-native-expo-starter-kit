import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/utils/utils';

type ChartContainerProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function ChartContainer({
  title,
  description,
  children,
  style,
}: ChartContainerProps) {
  return (
    <View
      className={cn('border-border bg-card w-full rounded-xl border p-4')}
      style={style}
    >
      {title && (
        <Text variant="h4" className="mb-1">
          {title}
        </Text>
      )}
      {description && (
        <Text variant="caption" className="text-muted-foreground mb-4">
          {description}
        </Text>
      )}
      {children}
    </View>
  );
}
