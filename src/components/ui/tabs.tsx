import type { LayoutChangeEvent } from 'react-native';
import * as TabsPrimitive from '@rn-primitives/tabs';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';
import { TextClassContext } from './text';

const AnimatedView = Animated.createAnimatedComponent(View);

type TabMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TabsMetricsContextValue = {
  register: (value: string, metrics: TabMetrics) => void;
};

const TabsMetricsContext = React.createContext<TabsMetricsContextValue>({
  register: () => {},
});

/**
 * ---------------------------------------------------------------------------
 * Tabs
 * ---------------------------------------------------------------------------
 */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

/**
 * ---------------------------------------------------------------------------
 * Sliding indicator
 * ---------------------------------------------------------------------------
 */

function useTabMetrics() {
  const [metrics, setMetrics] = React.useState<
    Record<string, TabMetrics>
  >({});

  const register = (tabValue: string, nextMetrics: TabMetrics) => {
    setMetrics((previous) => {
      const current = previous[tabValue];

      if (
        current
        && current.x === nextMetrics.x
        && current.y === nextMetrics.y
        && current.width === nextMetrics.width
        && current.height === nextMetrics.height
      ) {
        return previous;
      }

      return {
        ...previous,
        [tabValue]: nextMetrics,
      };
    });
  };

  return { metrics, register };
}

function useSlidingIndicator(
  metrics: Record<string, TabMetrics>,
  value: string,
) {
  const mountedRef = React.useRef(false);

  /**
   * Outer indicator position (layout-driven, no overshoot clipping).
   */
  const indicatorLeft = useSharedValue(0);
  const indicatorTop = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorHeight = useSharedValue(0);

  /**
   * Inner gooey/stretch layer.
   */
  const gooeyScaleX = useSharedValue(1);

  React.useEffect(() => {
    const target = metrics[value];

    if (!target) {
      return;
    }

    const positionConfig = {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    };

    const sizeConfig = {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    };

    /**
     * Initial positioning is instant to avoid flying from (0, 0).
     */
    if (!mountedRef.current) {
      mountedRef.current = true;

      indicatorLeft.set(target.x);
      indicatorTop.set(target.y);
      indicatorWidth.set(target.width);
      indicatorHeight.set(target.height);

      return;
    }

    indicatorLeft.set(withSpring(target.x, positionConfig));
    indicatorTop.set(withSpring(target.y, positionConfig));
    indicatorWidth.set(withSpring(target.width, sizeConfig));
    indicatorHeight.set(withSpring(target.height, sizeConfig));

    gooeyScaleX.set(withSequence(
      withSpring(1.08, {
        damping: 10,
        stiffness: 180,
        mass: 0.6,
      }),
      withSpring(1, {
        damping: 16,
        stiffness: 260,
        mass: 0.5,
      }),
    ));
  }, [
    value,
    metrics,
    indicatorLeft,
    indicatorTop,
    indicatorWidth,
    indicatorHeight,
    gooeyScaleX,
  ]);

  const indicatorContainerStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
    top: indicatorTop.value,
    width: indicatorWidth.value,
    height: indicatorHeight.value,
  }));

  const indicatorGooeyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: gooeyScaleX.value,
      },
    ],
  }));

  return { indicatorContainerStyle, indicatorGooeyStyle };
}

/**
 * ---------------------------------------------------------------------------
 * TabsList
 * ---------------------------------------------------------------------------
 */

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { value } = TabsPrimitive.useRootContext();
  const { metrics, register } = useTabMetrics();
  const {
    indicatorContainerStyle,
    indicatorGooeyStyle,
  } = useSlidingIndicator(metrics, value);

  /**
   * Don't render a zero-sized indicator before the active
   * tab has been measured (avoids the corner flash).
   */
  const activeMetrics = metrics[value];

  return (
    <TabsMetricsContext value={{ register }}>
      <TabsPrimitive.List
        className={cn(
          'relative flex h-9 flex-row items-center justify-center overflow-hidden rounded-lg bg-muted p-0.75',
          Platform.select({
            web: 'inline-flex w-fit',
            native: 'mr-auto',
          }),
          className,
        )}
        {...props}
      >
        {activeMetrics && (
          <AnimatedView
            pointerEvents="none"
            style={indicatorContainerStyle}
            className="absolute overflow-visible rounded-md"
          >
            <AnimatedView
              pointerEvents="none"
              style={indicatorGooeyStyle}
              className="size-full rounded-md bg-background shadow-sm dark:bg-input/30"
            />
          </AnimatedView>
        )}

        {children}
      </TabsPrimitive.List>
    </TabsMetricsContext>
  );
}

/**
 * ---------------------------------------------------------------------------
 * TabsTrigger
 * ---------------------------------------------------------------------------
 */

type TabsTriggerProps
  = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
    children: React.ReactNode;
  };

function TabsTrigger({
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value } = TabsPrimitive.useRootContext();
  const { register } = React.use(TabsMetricsContext);

  const isActive = props.value === value;

  const handleLayout = (event: LayoutChangeEvent) => {
    const {
      x,
      y,
      width,
      height,
    } = event.nativeEvent.layout;

    register(props.value, {
      x,
      y,
      width,
      height,
    });
  };

  return (
    <TextClassContext
      value={cn(
        'text-sm font-medium text-foreground dark:text-muted-foreground',
        isActive && 'dark:text-foreground',
      )}
    >
      <TabsPrimitive.Trigger
        {...props}
        onLayout={handleLayout}
        className={cn(
          [
            'flex flex-row items-center justify-center',
            'gap-1.5 rounded-md',
            'border border-transparent',
            'px-2 py-1',
            'shadow-none shadow-black/5',
          ],
          Platform.select({
            web: [
              'inline-flex',
              'h-full',
              'cursor-default',
              'whitespace-nowrap',
              'transition-[color,box-shadow]',
              'focus-visible:border-ring',
              'focus-visible:outline-1',
              'focus-visible:outline-ring',
              'focus-visible:ring-[3px]',
              'focus-visible:ring-ring/50',
              'disabled:pointer-events-none',
              '[&_svg]:pointer-events-none',
              '[&_svg]:shrink-0',
            ].join(' '),
          }),
          props.disabled && 'opacity-50',
          className,
        )}
      >
        {children}
      </TabsPrimitive.Trigger>
    </TextClassContext>
  );
}

/**
 * ---------------------------------------------------------------------------
 * TabsContent
 * ---------------------------------------------------------------------------
 */

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        Platform.select({
          web: 'flex-1 outline-none',
        }),
        className,
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
};
