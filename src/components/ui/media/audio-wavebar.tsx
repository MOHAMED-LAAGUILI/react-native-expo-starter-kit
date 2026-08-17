import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type WaveBarProps = {
  height: number;
  delay: number;
  duration: number;
  gradientColors: [string, string];
};

export function WaveBar({ height, delay, duration, gradientColors }: WaveBarProps) {
  const scale = useSharedValue(0.35);

  useEffect(() => {
    scale.set(withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    ));
  }, [delay, duration, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.get() }],
  }));

  return (
    <Animated.View
      className="mx-1.25 w-2 rounded-full"
      style={[{ height }, animatedStyle]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="size-full rounded-full"
      />
    </Animated.View>
  );
}
