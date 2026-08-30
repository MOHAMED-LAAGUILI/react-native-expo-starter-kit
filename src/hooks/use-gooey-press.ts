import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_PRESS } from '@/config/motion';

/**
 * Reusable "gooey" press interaction: the surface squashes and stretches like
 * a soft blob while the content subtly scales down. All animation runs on the
 * UI thread via Reanimated shared values — zero JS-thread work per frame.
 *
 * Wire `pressIn`/`pressOut` to a Pressable and spread `surfaceStyle` on an
 * `Animated.View` wrapping the surface (and optionally `contentStyle` on the
 * content).
 *
 * @example
 * const gooey = useGooeyPress(enabled);
 * <Pressable onPressIn={gooey.pressIn} onPressOut={gooey.pressOut}>
 *   <Animated.View style={gooey.surfaceStyle}>…</Animated.View>
 * </Pressable>
 */
export function useGooeyPress(enabled = true) {
  const progress = useSharedValue(0);

  const surfaceStyle = useAnimatedStyle(() => {
    if (!enabled)
      return {};
    return {
      transform: [
        { scaleX: interpolate(progress.value, [0, 0.5, 1], [1, 1.06, 1]) },
        { scaleY: interpolate(progress.value, [0, 0.5, 1], [1, 0.96, 1]) },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    if (!enabled)
      return {};
    return {
      transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.97]) }],
    };
  });

  const pressIn = () => {
    if (enabled)
      progress.set(withSpring(1, SPRING_PRESS));
  };

  const pressOut = () => {
    if (enabled)
      progress.set(withSpring(0, SPRING_PRESS));
  };

  return { contentStyle, enabled, pressIn, pressOut, progress, surfaceStyle };
}
