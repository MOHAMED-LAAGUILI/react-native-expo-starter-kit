import type { SharedValue } from 'react-native-reanimated';
import React, {
  useEffect,
  useState,
} from 'react';
import {
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

type WeightWidgetProps = {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
};

const PIXELS_PER_UNIT = 80;
const CARD_WIDTH = 300;
const CARD_HEIGHT = 240;

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 120,
  mass: 0.7,
  overshootClamping: false,
};

/**
 * Drag/velocity multiplier. Values above 1 make the
 * dial feel looser and more responsive, like a real
 * weight roulette.
 */
const DRAG_SENSITIVITY = 1.2;

/**
 * withDecay per-frame deceleration. Lower = the spin
 * fades out faster after a fling.
 */
const DECELERATION = 0.997;

/* ============================================================
   WORKLET STYLE BUILDERS
============================================================ */

/**
 * Everything below runs on the UI thread.
 */
function getDialItemStyle(
  scrollX: SharedValue<number>,
  itemX: number,
) {
  'worklet';

  const distance = Math.abs(
    scrollX.value + itemX,
  );

  const opacity = interpolate(
    distance,
    [
      0,
      PIXELS_PER_UNIT * 2,
      PIXELS_PER_UNIT * 3,
    ],
    [1, 0.4, 0],
    Extrapolation.CLAMP,
  );

  const scale = interpolate(
    distance,
    [
      0,
      PIXELS_PER_UNIT * 2,
    ],
    [1, 0.85],
    Extrapolation.CLAMP,
  );

  /**
   * Curved / circular dial movement.
   */
  const y = interpolate(
    distance,
    [
      0,
      PIXELS_PER_UNIT * 0.5,
      PIXELS_PER_UNIT,
      PIXELS_PER_UNIT * 1.5,
      PIXELS_PER_UNIT * 2,
      PIXELS_PER_UNIT * 2.5,
      PIXELS_PER_UNIT * 3,
    ],
    [0, 2, 7, 17, 32, 54, 88],
    Extrapolation.CLAMP,
  );

  /**
   * Rotate each number around the dial.
   */
  const rotation = interpolate(
    scrollX.value + itemX,
    [
      -PIXELS_PER_UNIT * 3,
      PIXELS_PER_UNIT * 3,
    ],
    [-36, 36],
    Extrapolation.CLAMP,
  );

  return {
    opacity,
    transform: [
      {
        translateX:
          itemX - PIXELS_PER_UNIT / 2,
      },
      {
        translateY: y,
      },
      {
        scale,
      },
      {
        rotate: `${rotation}deg`,
      },
    ],
  };
}

function getDialItemTextStyle(
  scrollX: SharedValue<number>,
  itemX: number,
) {
  'worklet';

  const distance = Math.abs(
    scrollX.value + itemX,
  );

  const colorProgress = interpolate(
    distance,
    [0, PIXELS_PER_UNIT],
    [0, 1],
    Extrapolation.CLAMP,
  );

  /**
   * Non-centered numbers fade out.
   */
  return {
    opacity: interpolate(
      colorProgress,
      [0, 1],
      [1, 0.15],
      Extrapolation.CLAMP,
    ),
  };
}

/* ============================================================
   USE DIAL PAN
============================================================ */

type UseDialPanOptions = {
  initialValue: number;
  min: number;
  max: number;
};

/**
 * Only the dial entries within a few units of the current value are mounted;
 * the full min..max range would be hundreds of animated nodes.
 */
function buildVisibleRange(min: number, max: number, displayValue: number) {
  const items: number[] = [];
  const buffer = 5;
  const start = Math.max(min, displayValue - buffer);
  const end = Math.min(max, displayValue + buffer);

  for (let i = start; i <= end; i += 0.5) {
    items.push(i);
  }

  return items;
}

/**
 * After the spin fades out, spring onto the nearest
 * integer so the dial never rests between values.
 */
function settleToNearestInteger(
  min: number,
  max: number,
  x: SharedValue<number>,
) {
  'worklet';

  const nearest = Math.round(
    -x.value / PIXELS_PER_UNIT,
  );

  const clamped = Math.max(
    min,
    Math.min(max, nearest),
  );

  x.value = withSpring(
    -clamped * PIXELS_PER_UNIT,
    SPRING_CONFIG,
  );
}

// The three gesture callbacks operate over the same UI-thread shared values.

function useDialPan({
  initialValue,
  min,
  max,
}: UseDialPanOptions) {
  const initialX
    = -initialValue * PIXELS_PER_UNIT;

  const x = useSharedValue(initialX);
  const dragStartX = useSharedValue(initialX);

  const handlePanStart = () => {
    'worklet';

    dragStartX.value = x.value;
  };

  /**
   * Flexible drag: the dial follows the finger with a
   * sensitivity boost and rubber-bands at the edges.
   */
  const handlePanUpdate = (translationX: number) => {
    'worklet';

    const minX
      = -max * PIXELS_PER_UNIT;
    const maxX
      = -min * PIXELS_PER_UNIT;

    const rawX
      = dragStartX.value
        + translationX
        * DRAG_SENSITIVITY;

    if (rawX < minX) {
      x.value
        = minX
          - (minX - rawX) * 0.25;
    }
    else if (rawX > maxX) {
      x.value
        = maxX
          + (rawX - maxX) * 0.25;
    }
    else {
      x.value = rawX;
    }
  };

  /**
   * Roulette release: keep spinning with momentum
   * (withDecay), then settle on the nearest integer
   * once the spin stops.
   */
  const handlePanEnd = (velocityX: number) => {
    'worklet';

    const minX
      = -max * PIXELS_PER_UNIT;
    const maxX
      = -min * PIXELS_PER_UNIT;

    x.value = withDecay(
      {
        velocity:
          velocityX
          * DRAG_SENSITIVITY,
        deceleration:
          DECELERATION,
        clamp: [minX, maxX],
      },
      (isFinished) => {
        'worklet';

        if (isFinished) {
          settleToNearestInteger(
            min,
            max,
            x,
          );
        }
      },
    );
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      handlePanStart();
    })
    .onUpdate((event) => {
      handlePanUpdate(
        event.translationX,
      );
    })
    .onEnd((event) => {
      handlePanEnd(
        event.velocityX,
      );
    });

  return {
    x,
    panGesture,
  };
}

/* ============================================================
   USE DIAL VALUE
============================================================ */

type UseDialValueOptions = {
  x: SharedValue<number>;
  initialValue: number;
  min: number;
  max: number;
  onChange?: (value: number) => void;
};

function useDialValue({
  x,
  initialValue,
  min,
  max,
  onChange,
}: UseDialValueOptions) {
  const [displayValue, setDisplayValue]
    = useState(initialValue);

  /**
   * Keep the React state synchronized with the
   * Reanimated value.
   */
  useAnimatedReaction(
    () =>
      Math.round(
        Math.abs(
          x.value
          / PIXELS_PER_UNIT,
        ),
      ),
    (value, previousValue) => {
      if (value === previousValue) {
        return;
      }

      const clampedValue = Math.max(
        min,
        Math.min(max, value),
      );

      scheduleOnRN(setDisplayValue, clampedValue);

      if (onChange) {
        scheduleOnRN(onChange, clampedValue);
      }
    },
    [min, max, onChange],
  );

  return displayValue;
}

/* ============================================================
   DIAL ITEM
============================================================ */

type DialItemProps = {
  value: number;
  scrollX: SharedValue<number>;
  numberColor: string;
  tickColor: string;
};

function DialItem({
  value,
  scrollX,
  numberColor,
  tickColor,
}: DialItemProps) {
  const isHalf = value % 1 !== 0;
  const itemX = value * PIXELS_PER_UNIT;

  const animatedStyle
    = useAnimatedStyle(() =>
      getDialItemStyle(
        scrollX,
        itemX,
      ),
    );

  const textAnimatedStyle
    = useAnimatedStyle(() =>
      getDialItemTextStyle(
        scrollX,
        itemX,
      ),
    );

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          width: PIXELS_PER_UNIT,
          alignItems: 'center',
        },
        animatedStyle,
      ]}
    >
      <Animated.Text
        style={[
          {
            fontSize: isHalf ? 18 : 56,
            lineHeight: isHalf ? 24 : 68,
            fontWeight: isHalf ? '600' : '700',
            letterSpacing: isHalf ? 0 : -2,
            color: isHalf
              ? tickColor
              : numberColor,
          },
          textAnimatedStyle,
        ]}
      >
        {isHalf
          ? value.toFixed(1)
          : Math.floor(value)}
      </Animated.Text>

      {/* Tick */}
      <View className="mt-2 items-center">
        <View
          className="rounded-full"
          style={{
            width: 2.5,
            height: 20,
            backgroundColor: tickColor,
          }}
        />
      </View>
    </Animated.View>
  );
}

/* ============================================================
   DIAL INDICATOR
============================================================ */

function DialIndicator({
  primaryHex,
}: {
  primaryHex: string;
}) {
  return (
    <View
      pointerEvents="none"
      className="absolute bottom-1 z-20 items-center"
    >
      <View
        className="mb-1.5 rounded-full"
        style={{
          width: 5,
          height: 5,
          backgroundColor: primaryHex,
        }}
      />

      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 28,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: primaryHex,
        }}
      />
    </View>
  );
}

/* ============================================================
   DIAL
============================================================ */

type DialProps = {
  x: SharedValue<number>;
  panGesture: ReturnType<
    typeof Gesture.Pan
  >;
  visibleRange: number[];
  text: string;
  muted: string;
  primaryHex: string;
};

function Dial({
  x,
  panGesture,
  visibleRange,
  text,
  muted,
  primaryHex,
}: DialProps) {
  /*
   * The dial scrolls horizontally so the slot
   * matching the current value always sits at
   * the card center.
   */
  const dialAnimatedStyle
    = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: x.value,
        },
      ],
    }));

  return (
    <GestureDetector gesture={panGesture}>
      <View className="relative w-full flex-1 items-center overflow-hidden">
        <Animated.View
          className="absolute top-0 size-full"
          style={[
            {
              left: '50%',
            },
            dialAnimatedStyle,
          ]}
        >
          {visibleRange.map(
            value => (
              <DialItem
                key={value}
                value={value}
                scrollX={x}
                numberColor={text}
                tickColor={muted}
              />
            ),
          )}
        </Animated.View>

        <DialIndicator
          primaryHex={primaryHex}
        />
      </View>
    </GestureDetector>
  );
}

/* ============================================================
   WEIGHT WIDGET
============================================================ */

export function WeightWidget({
  initialValue = 25,
  min = 0,
  max = 100,
  onChange,
}: WeightWidgetProps) {
  const { text, muted }
    = useThemeColors();

  const primaryHex = usePrimaryHex();

  const [mounted, setMounted]
    = useState(false);

  const { x, panGesture } = useDialPan({
    initialValue,
    min,
    max,
  });

  const displayValue = useDialValue({
    x,
    initialValue,
    min,
    max,
    onChange,
  });

  useEffect(() => {
    const frame
      = requestAnimationFrame(() => {
        setMounted(true);
      });

    return () =>
      cancelAnimationFrame(frame);
  }, []);

  const visibleRange = buildVisibleRange(min, max, displayValue);

  if (!mounted) {
    return null;
  }

  return (
    <View
      className="border-border bg-card items-center self-center overflow-hidden rounded-[28px] border-2"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,

        boxShadow: '0px 8px 18px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Title */}
      <Text className="text-muted-foreground mt-5 text-base font-semibold tracking-wide capitalize">
        Weight
      </Text>

      {/* Dial */}
      <Dial
        x={x}
        panGesture={panGesture}
        visibleRange={visibleRange}
        text={text}
        muted={muted}
        primaryHex={primaryHex}
      />
    </View>
  );
}
