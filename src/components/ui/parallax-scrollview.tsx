import type { PropsWithChildren, ReactElement } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isIOS } from '@/utils/platform';

const SPRING_CONFIG = { damping: 14, stiffness: 180, mass: 0.6 };

type Props = PropsWithChildren<{
  headerHeight?: number;
  headerImage: ReactElement;
}>;

export function ParallaxScrollView({
  children,
  headerHeight = 250,
  headerImage,
}: Props) {
  const { background: backgroundColor } = useThemeColors();
  const { bottom } = useSafeAreaInsets();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const pull = useSharedValue(0);
  const startedAtTop = useSharedValue(false);
  const reduceMotion = useReducedMotion();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const nativeGesture = Gesture.Native();
  const pullGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeGesture)
    .onBegin(() => {
      startedAtTop.value = scrollY.value <= 0;
    })
    .onUpdate((event) => {
      if (startedAtTop.value && event.translationY > 0) {
        pull.value = Math.min(event.translationY, headerHeight);
      }
    })
    .onEnd(() => {
      pull.value = withSpring(0, SPRING_CONFIG);
    })
    .onFinalize(() => {
      pull.value = withSpring(0, SPRING_CONFIG);
    });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ translateY: 0 }, { scale: 1 }] };
    }

    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, headerHeight],
            [0, headerHeight * 0.75],
          ),
        },
        {
          scale: (1 + pull.value / headerHeight) * interpolate(
            scrollY.value,
            [0, headerHeight],
            [1, 1.15],
          ),
        },
      ],
      transformOrigin: 'top center',
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pull.value }],
  }));

  return (
    <View className="flex-1">
      <GestureDetector gesture={Gesture.Simultaneous(nativeGesture, pullGesture)}>
        <Animated.ScrollView
          ref={scrollRef}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          scrollIndicatorInsets={{ bottom }}
          contentInset={isIOS ? { bottom } : undefined}
          contentContainerStyle={isIOS ? undefined : { paddingBottom: bottom }}
        >
          <Animated.View
            className="overflow-hidden"
            style={[
              {
                backgroundColor,
                height: headerHeight,
              },
              headerAnimatedStyle,
            ]}
          >
            {headerImage}
          </Animated.View>
          <Animated.View
            className="flex-1 gap-4 overflow-hidden p-8"
            style={[{ backgroundColor }, contentAnimatedStyle]}
          >
            {children}
          </Animated.View>
        </Animated.ScrollView>
      </GestureDetector>
    </View>
  );
}
