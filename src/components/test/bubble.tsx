import type { PressableProps, ViewProps } from 'react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { TextClassContext } from '@/components/ui';
import { useGooeyPress } from '@/hooks/use-gooey-press';
import { cn } from '@/utils/cn';
import { MessageAlignContext } from './message';

type BubbleVariant = 'default' | 'secondary' | 'muted' | 'tinted' | 'outline' | 'ghost' | 'destructive';
type BubbleAlign = 'start' | 'end';
type BubbleSide = 'top' | 'bottom';

type BubbleProps = ViewProps & {
  variant?: BubbleVariant;
  /** Defaults to the parent `Message` alignment when omitted. */
  align?: BubbleAlign;
};

type BubbleContentProps = Omit<PressableProps, 'children'> & {
  children?: React.ReactNode;
  className?: string;
};

type BubbleReactionsProps = ViewProps & {
  align?: BubbleAlign;
  side?: BubbleSide;
};

const CONTENT_CLASS: Record<BubbleVariant, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  tinted: 'bg-primary/15',
  outline: 'border border-border bg-background',
  ghost: 'rounded-none bg-transparent px-0 py-0',
  destructive: 'bg-destructive/10',
};

const TEXT_CLASS: Record<BubbleVariant, string> = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  muted: 'text-foreground',
  tinted: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive',
};

const BubbleVariantContext = React.createContext<BubbleVariant>('default');

const AnimatedView = Animated.createAnimatedComponent(View);

function BubbleGroup({ className, ...props }: ViewProps) {
  return <View className={cn('w-full min-w-0 flex-col gap-2', className)} {...props} />;
}

function Bubble({ variant = 'default', align, className, children, ...props }: BubbleProps) {
  const messageAlign = React.use(MessageAlignContext);
  const resolvedAlign = align ?? messageAlign;
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className={cn(
        'relative max-w-[80%] min-w-0 flex-col gap-1',
        resolvedAlign === 'end' ? 'self-end' : 'self-start',
        variant === 'ghost' && 'max-w-full',
        className,
      )}
      {...props}
    >
      <BubbleVariantContext value={variant}>{children}</BubbleVariantContext>
    </Animated.View>
  );
}

function BubbleContent({ className, children, onPress, ...props }: BubbleContentProps) {
  const variant = React.use(BubbleVariantContext);
  const gooey = useGooeyPress(Boolean(onPress));
  return (
    <TextClassContext value={cn('text-sm/relaxed', TEXT_CLASS[variant])}>
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        onPressIn={gooey.pressIn}
        onPressOut={gooey.pressOut}
        accessibilityRole={onPress ? 'button' : undefined}
        {...props}
      >
        <AnimatedView
          style={gooey.surfaceStyle}
          className={cn(
            'max-w-full min-w-0 overflow-hidden rounded-3xl px-3 py-2.5',
            CONTENT_CLASS[variant],
            className,
          )}
        >
          {children}
        </AnimatedView>
      </Pressable>
    </TextClassContext>
  );
}

function BubbleReactions({ side = 'bottom', align = 'end', className, children, ...props }: BubbleReactionsProps) {
  return (
    <Animated.View
      entering={ZoomIn.duration(250)}
      className={cn(
        'absolute z-10 flex-row items-center justify-center gap-1 rounded-full border-2 border-card bg-muted px-1.5 py-0.5',
        side === 'bottom' ? '-bottom-3' : '-top-3',
        align === 'end' ? 'right-3' : 'left-3',
        className,
      )}
      {...props}
    >
      <TextClassContext value="text-sm">{children}</TextClassContext>
    </Animated.View>
  );
}

export type { BubbleAlign, BubbleProps, BubbleVariant };
export { Bubble, BubbleContent, BubbleGroup, BubbleReactions };
