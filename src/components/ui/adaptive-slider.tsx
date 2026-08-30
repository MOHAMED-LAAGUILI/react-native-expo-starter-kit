import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { cn } from '@/utils/cn';

type SliderSize = 'xs' | 'sm' | 'md' | 'lg';

type AdaptiveSliderProps = {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  size?: SliderSize;
  className?: string;
};

type ColorSettings = {
  text: string;
  gradient: readonly [string, string, ...string[]];
};

const DEFAULT_MIN = 50;
const DEFAULT_MAX = 350;
const DEFAULT_STEP = 25;
const DEFAULT_VALUE = 200;

const TRACK_HEIGHT = 52;
const THUMB_SIZE = 52;
const THUMB_INNER_SIZE = 40;
const BACKGROUND_DOT_IDS = ['start', 'one', 'two', 'three', 'four', 'end'];

const SIZE_PRESETS: Record<SliderSize, { trackHeight: number; thumbSize: number; thumbInnerSize: number; valueFontClass: string; labelFontClass: string; spacingClass: string }> = {
  xs: { trackHeight: 28, thumbSize: 28, thumbInnerSize: 20, valueFontClass: 'text-2xl', labelFontClass: 'text-xs', spacingClass: 'mb-4' },
  sm: { trackHeight: 36, thumbSize: 36, thumbInnerSize: 28, valueFontClass: 'text-3xl', labelFontClass: 'text-sm', spacingClass: 'mb-5' },
  md: { trackHeight: 44, thumbSize: 44, thumbInnerSize: 34, valueFontClass: 'text-4xl', labelFontClass: 'text-base', spacingClass: 'mb-6' },
  lg: { trackHeight: TRACK_HEIGHT, thumbSize: THUMB_SIZE, thumbInnerSize: THUMB_INNER_SIZE, valueFontClass: 'text-5xl', labelFontClass: 'text-lg', spacingClass: 'mb-8' },
};

type Rgb = [number, number, number];

const BLACK: Rgb = [0, 0, 0];

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = Number.parseInt(full, 16);

  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mix(hex: string, target: Rgb, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const out = [r, g, b].map((c, i) =>
    Math.round(c + (target[i] - c) * amount),
  );

  return `#${out.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

function getColorSettings(primary: string, percentage: number): ColorSettings {
  if (percentage < 0.7) {
    return {
      text: primary,
      gradient: [primary, primary],
    };
  }

  return {
    text: primary,
    gradient: [primary, mix(primary, BLACK, 0.18)],
  };
}

// Shared by the JS thread and the pan worklet, so it must be workletizable.
function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, step: number, min: number) {
  const stepped = Math.round((value - min) / step) * step + min;

  return stepped;
}

type SliderSizes = { trackHeight: number; thumbSize: number };

function useSliderAnimations(opts: {
  calories: number;
  percentage: number;
  progress: SharedValue<number>;
  displayValue: SharedValue<number>;
}) {
  const { calories, percentage, progress, displayValue } = opts;

  useEffect(() => {
    progress.set(withSpring(clamp(percentage, 0, 1), {
      stiffness: 300,
      damping: 30,
      mass: 0.7,
    }));

    displayValue.set(withTiming(calories, {
      duration: 120,
      easing: Easing.out(Easing.ease),
    }));
  }, [calories, percentage, progress, displayValue]);
}

export function AdaptiveSlider({
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  defaultValue = DEFAULT_VALUE,
  onChange,
  size = 'lg',
  className,
}: AdaptiveSliderProps) {
  const primaryHex = usePrimaryHex();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [trackWidth, setTrackWidth] = useState(0);

  const preset = SIZE_PRESETS[size];

  const isControlled = value !== undefined;
  const calories = value ?? internalValue;
  const percentage = (calories - min) / (max - min);

  const colorSettings = getColorSettings(primaryHex, percentage);

  const progress = useSharedValue(percentage);
  const displayValue = useSharedValue(calories);
  const usableWidth = Math.max(trackWidth - preset.thumbSize, 0);

  useSliderAnimations({ calories, percentage, progress, displayValue });

  const updateValue = (nextValue: number) => {
    const next = clamp(roundToStep(nextValue, step, min), min, max);

    if (!isControlled) {
      setInternalValue(next);
    }

    onChange?.(next);
  };

  const setPosition = (position: number) => {
    if (usableWidth <= 0)
      return;

    const next = clamp(position, 0, usableWidth);

    updateValue(min + (next / usableWidth) * (max - min));
  };

  const panGesture = useDragGesture({
    usableWidth,
    onPosition: setPosition,
    thumbSize: preset.thumbSize,
  });

  const { fillAnimatedStyle, thumbAnimatedStyle }
    = useTrackAnimations({ progress, trackWidth, usableWidth, sizes: { trackHeight: preset.trackHeight, thumbSize: preset.thumbSize } });

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      className={cn(
        'w-full flex-col items-center justify-center',
        className,
      )}
    >
      <SliderHeader
        displayValue={displayValue}
        color={colorSettings.text}
        valueFontClass={preset.valueFontClass}
        labelFontClass={preset.labelFontClass}
        spacingClass={preset.spacingClass}
      />

      <SliderTrack
        trackWidth={trackWidth}
        gradient={colorSettings.gradient}
        fillStyle={fillAnimatedStyle}
        thumbStyle={thumbAnimatedStyle}
        onTrackLayout={handleTrackLayout}
        panGesture={panGesture}
        trackHeight={preset.trackHeight}
        thumbSize={preset.thumbSize}
        thumbInnerSize={preset.thumbInnerSize}
      />
    </View>
  );
}

/* ================================================================
   TRACK ANIMATIONS
================================================================ */

function useTrackAnimations(opts: {
  progress: SharedValue<number>;
  trackWidth: number;
  usableWidth: number;
  sizes: SliderSizes;
}) {
  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      opts.progress.value,
      [0, 1],
      [opts.sizes.thumbSize, opts.trackWidth],
    ),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          opts.progress.value,
          [0, 1],
          [0, opts.usableWidth],
        ),
      },
    ],
  }));

  return { fillAnimatedStyle, thumbAnimatedStyle };
}

/* ================================================================
   DRAG HANDLERS
================================================================ */

/**
 * Drag handling runs on the UI thread via gesture-handler; `PanResponder`
 * dispatches every move through the JS thread and stutters when it is busy.
 * `onBegin` fires on touch-down so a plain tap still seeks, matching the
 * eager `onStartShouldSetPanResponder` behaviour it replaces.
 */
function useDragGesture({
  usableWidth,
  onPosition,
  thumbSize,
}: {
  usableWidth: number;
  onPosition: (position: number) => void;
  thumbSize: number;
}) {
  const dragStart = useSharedValue(0);

  return Gesture.Pan()
    .onBegin((event) => {
      const start = clamp(event.x - thumbSize / 2, 0, usableWidth);

      dragStart.value = start;
      scheduleOnRN(onPosition, start);
    })
    .onUpdate((event) => {
      scheduleOnRN(
        onPosition,
        clamp(dragStart.value + event.translationX, 0, usableWidth),
      );
    });
}

/* ================================================================
   HEADER (title + value)
================================================================ */

type SliderHeaderProps = {
  displayValue: SharedValue<number>;
  color: string;
  valueFontClass: string;
  labelFontClass: string;
  spacingClass: string;
};

function SliderHeader({
  displayValue,
  color,
  valueFontClass,
  labelFontClass,
  spacingClass,
}: SliderHeaderProps) {
  return (
    <>
      <View className={cn('flex-row items-baseline', spacingClass)}>
        <AnimatedCalories
          value={displayValue}
          color={color}
          fontClass={valueFontClass}
        />

        <Text className={cn('ml-2 font-extrabold text-foreground', labelFontClass)}>
          kCal
        </Text>
      </View>
    </>
  );
}

/* ================================================================
   TRACK
================================================================ */

type SliderTrackProps = {
  trackWidth: number;
  gradient: readonly [string, string, ...string[]];
  fillStyle: AnimatedStyle<ViewStyle>;
  thumbStyle: AnimatedStyle<ViewStyle>;
  onTrackLayout: (event: LayoutChangeEvent) => void;
  panGesture: PanGesture;
  trackHeight: number;
  thumbSize: number;
  thumbInnerSize: number;
};

function SliderTrack({
  trackWidth,
  gradient,
  fillStyle,
  thumbStyle,
  onTrackLayout,
  panGesture,
  trackHeight,
  thumbSize,
  thumbInnerSize,
}: SliderTrackProps) {
  return (
    <GestureDetector gesture={panGesture}>
      <View
        className="relative w-full overflow-hidden rounded-full bg-muted"
        style={{
          height: trackHeight,
        }}
        onLayout={onTrackLayout}
      >
        {/* Background dots */}
        <View
          pointerEvents="none"
          className="absolute inset-0 flex-row items-center justify-between px-4"
        >
          {BACKGROUND_DOT_IDS.map(id => (
            <View
              key={id}
              className="size-1.5 rounded-full bg-primary/30"
            />
          ))}
        </View>

        {/* Gradient fill */}
        {trackWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            className="absolute top-0 left-0 overflow-hidden rounded-full"
            style={[
              {
                height: trackHeight,
              },
              fillStyle,
            ]}
          >
            <LinearGradient
              colors={gradient}
              start={{
                x: 0,
                y: 0.5,
              }}
              end={{
                x: 1,
                y: 0.5,
              }}
              style={{
                width: trackWidth,
                height: trackHeight,
              }}
            />
          </Animated.View>
        )}

        {/* Thumb */}
        <Animated.View
          pointerEvents="none"
          className="absolute top-0 left-0 items-center justify-center"
          style={[
            {
              width: thumbSize,
              height: thumbSize,
            },
            thumbStyle,
          ]}
        >
          <View
            className="items-center justify-center rounded-full bg-background"
            style={{
              width: thumbInnerSize,
              height: thumbInnerSize,

              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
            }}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

/**
 * Animated calorie number.
 *
 * Reanimated animates the numeric value without needing
 * AnimatePresence from Motion.
 */
function AnimatedCalories({
  value,
  color,
  fontClass,
}: {
  value: SharedValue<number>;
  color: string;
  fontClass: string;
}) {
  const [displayValue, setDisplayValue] = useState(
    () => Math.round(value.value),
  );

  // Observe the shared value on the UI thread and only touch React state when
  // the rounded value actually changes — a rAF setState loop runs every frame
  // for the component's whole lifetime, even while idle.
  useAnimatedReaction(
    () => Math.round(value.value),
    (current, previous) => {
      if (current !== previous) {
        scheduleOnRN(setDisplayValue, current);
      }
    },
  );

  return (
    <View>
      <Text
        className={cn('font-extrabold tracking-tight', fontClass)}
        style={{
          color,
        }}
      >
        {displayValue}
      </Text>
    </View>
  );
}
