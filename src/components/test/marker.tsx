import type { ViewProps } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TextClassContext } from '@/components/ui';
import { cn } from '@/utils/cn';

type MarkerVariant = 'default' | 'separator' | 'border';

type MarkerProps = ViewProps & {
  variant?: MarkerVariant;
};

const MarkerVariantContext = React.createContext<MarkerVariant>('default');

function Marker({ variant = 'default', className, children, ...props }: MarkerProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className={cn(
        'min-h-4 w-full flex-row items-center gap-2',
        variant === 'border' && 'border-border border-b pb-2',
        className,
      )}
      {...props}
    >
      <MarkerVariantContext value={variant}>
        {variant === 'separator' && <View className="bg-border h-px min-w-0 flex-1" />}
        {children}
        {variant === 'separator' && <View className="bg-border h-px min-w-0 flex-1" />}
      </MarkerVariantContext>
    </Animated.View>
  );
}

function MarkerIcon({ className, ...props }: ViewProps) {
  return (
    <View
      accessibilityElementsHidden
      className={cn('size-4 shrink-0 items-center justify-center', className)}
      {...props}
    />
  );
}

function MarkerContent({ className, children, ...props }: ViewProps) {
  const variant = React.use(MarkerVariantContext);
  return (
    <View className={cn('min-w-0', variant !== 'separator' && 'flex-1', className)} {...props}>
      <TextClassContext
        value={cn('text-muted-foreground text-sm', variant === 'separator' && 'text-center')}
      >
        {children}
      </TextClassContext>
    </View>
  );
}

export type { MarkerProps, MarkerVariant };
export { Marker, MarkerContent, MarkerIcon };
