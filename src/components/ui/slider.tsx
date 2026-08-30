import SliderNative from '@react-native-community/slider';
import * as React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';

type SliderOrientation = 'horizontal' | 'vertical';

type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  orientation?: SliderOrientation;
  /** Track length in px when `orientation="vertical"`. */
  verticalLength?: number;
};

const THUMB_SIZE = 20;
const TOUCH_WIDTH = 40;
const TRACK_WIDTH = 6;

/**
 * Custom gesture-driven vertical track. The native slider can only be made
 * vertical with a rotate transform, but inside a ScrollView the vertical drag
 * is then claimed by the scroll gesture and the thumb never moves. A
 * `Gesture.Pan` with a tight `activeOffsetY` activates before the ScrollView's
 * drag threshold, wins the gesture race, and blocks scrolling while dragging.
 */
function VerticalSlider({
  value,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  verticalLength = 160,
}: SliderProps) {
  const primaryHex = usePrimaryHex();
  const { border } = useThemeColors();
  const range = Math.max(max - min, Number.EPSILON);
  const ratio = useSharedValue(Math.min(Math.max((value - min) / range, 0), 1));
  const dragging = useSharedValue(false);
  const reported = useSharedValue(value);

  React.useEffect(() => {
    if (!dragging.get())
      ratio.set(Math.min(Math.max((value - min) / range, 0), 1));
  }, [value, min, range, dragging, ratio]);

  const applyTouch = (y: number) => {
    'worklet';
    const next = Math.min(Math.max(1 - y / verticalLength, 0), 1);
    ratio.value = next;
    const raw = min + next * range;
    const stepped = step > 0 ? min + Math.round((raw - min) / step) * step : raw;
    const clamped = Math.min(Math.max(stepped, min), max);
    if (clamped !== reported.value) {
      reported.value = clamped;
      scheduleOnRN(onValueChange, clamped);
    }
  };

  const finish = () => {
    'worklet';
    dragging.value = false;
    if (onSlidingComplete)
      scheduleOnRN(onSlidingComplete, reported.value);
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetY([-2, 2])
    .onStart((event) => {
      dragging.value = true;
      applyTouch(event.y);
    })
    .onUpdate(event => applyTouch(event.y))
    .onFinalize(finish);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((event) => {
      applyTouch(event.y);
      finish();
    });

  const fillStyle = useAnimatedStyle(() => ({ height: `${ratio.value * 100}%` }));
  const thumbStyle = useAnimatedStyle(() => ({ bottom: ratio.value * (verticalLength - THUMB_SIZE) }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        accessibilityRole="adjustable"
        accessibilityState={{ disabled }}
        accessibilityValue={{ max, min, now: value }}
        className={cn('items-center justify-center self-center', disabled && 'opacity-50', className)}
        style={{ height: verticalLength, width: TOUCH_WIDTH }}
      >
        <View
          className="h-full overflow-hidden rounded-full"
          style={{ backgroundColor: border, width: TRACK_WIDTH }}
        >
          <Animated.View
            className="absolute bottom-0 w-full rounded-full"
            style={[fillStyle, { backgroundColor: primaryHex }]}
          />
        </View>
        <Animated.View
          className="absolute rounded-full"
          style={[thumbStyle, { backgroundColor: primaryHex, height: THUMB_SIZE, width: THUMB_SIZE }]}
        />
      </View>
    </GestureDetector>
  );
}

function Slider(props: SliderProps) {
  const {
    value,
    onValueChange,
    onSlidingComplete,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    className,
    orientation = 'horizontal',
  } = props;
  const primaryHex = usePrimaryHex();
  const { border } = useThemeColors();

  if (orientation === 'vertical')
    return <VerticalSlider {...props} />;

  return (
    <View className={cn('h-10 justify-center', disabled && 'opacity-50', className)}>
      <SliderNative
        style={{ height: 40, width: '100%' }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
        minimumTrackTintColor={primaryHex}
        maximumTrackTintColor={border}
        thumbTintColor={primaryHex}
        tapToSeek
      />
    </View>
  );
}

export type { SliderOrientation, SliderProps };
export { Slider };
