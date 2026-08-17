import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type ZoomState = {
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  savedScale: SharedValue<number>;
  savedTranslateX: SharedValue<number>;
  savedTranslateY: SharedValue<number>;
  panGestureEnabled: SharedValue<boolean>;
};

type ZoomOptions = {
  enableZoom: boolean;
  onSetCanSwipe: (canSwipe: boolean) => void;
  screenWidth: number;
  screenHeight: number;
};

type ZoomHelpers = {
  resetZoom: () => void;
  constrainTranslation: (
    scale: number,
    x: number,
    y: number,
  ) => { x: number; y: number };
};

function createResetZoom(state: ZoomState, onSetCanSwipe: (canSwipe: boolean) => void) {
  const { scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY, panGestureEnabled } = state;

  return () => {
    'worklet';
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    panGestureEnabled.value = false;
    scheduleOnRN(onSetCanSwipe, true);
  };
}

function createConstrainTranslation(screenWidth: number, screenHeight: number) {
  return (newScale: number, newTranslateX: number, newTranslateY: number) => {
    'worklet';
    const maxTranslateX = Math.max(0, (screenWidth * newScale - screenWidth) / 2);
    const maxTranslateY = Math.max(0, (screenHeight * newScale - screenHeight) / 2);
    const constrainedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
    const constrainedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));

    return { x: constrainedX, y: constrainedY };
  };
}

function createDoubleTapGesture(options: ZoomOptions, state: ZoomState, helpers: ZoomHelpers) {
  const { enableZoom, screenWidth, screenHeight, onSetCanSwipe } = options;
  const { resetZoom, constrainTranslation } = helpers;

  return Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (!enableZoom)
        return;

      if (state.scale.value > 1.1) {
        resetZoom();
      }
      else {
        const targetScale = 2.5;
        const tapX = event.x - screenWidth / 2;
        const tapY = event.y - screenHeight / 2;
        const newTranslateX = (-tapX * (targetScale - 1)) / targetScale;
        const newTranslateY = (-tapY * (targetScale - 1)) / targetScale;
        const constrained = constrainTranslation(targetScale, newTranslateX, newTranslateY);

        state.scale.value = withSpring(targetScale, { damping: 20, stiffness: 300 });
        state.translateX.value = withSpring(constrained.x, { damping: 20, stiffness: 300 });
        state.translateY.value = withSpring(constrained.y, { damping: 20, stiffness: 300 });
        state.savedScale.value = targetScale;
        state.savedTranslateX.value = constrained.x;
        state.savedTranslateY.value = constrained.y;
        state.panGestureEnabled.value = true;
        scheduleOnRN(onSetCanSwipe, false);
      }
    });
}

function createPinchGesture(options: ZoomOptions, state: ZoomState, helpers: ZoomHelpers) {
  const { enableZoom, screenWidth, screenHeight, onSetCanSwipe } = options;
  const { resetZoom, constrainTranslation } = helpers;

  return Gesture.Pinch()
    .onStart(() => {
      if (!enableZoom)
        return;
      state.savedScale.value = state.scale.value;
      state.savedTranslateX.value = state.translateX.value;
      state.savedTranslateY.value = state.translateY.value;
    })
    .onUpdate((event) => {
      if (!enableZoom)
        return;

      const newScale = Math.max(0.8, Math.min(4, state.savedScale.value * event.scale));
      const focalX = event.focalX - screenWidth / 2;
      const focalY = event.focalY - screenHeight / 2;
      const scaleDiff = newScale / state.savedScale.value;
      const newTranslateX = state.savedTranslateX.value + focalX * (1 - scaleDiff);
      const newTranslateY = state.savedTranslateY.value + focalY * (1 - scaleDiff);
      const constrained = constrainTranslation(newScale, newTranslateX, newTranslateY);

      state.scale.value = newScale;
      state.translateX.value = constrained.x;
      state.translateY.value = constrained.y;
      state.panGestureEnabled.value = newScale > 1.1;
      scheduleOnRN(onSetCanSwipe, newScale <= 1.1);
    })
    .onEnd(() => {
      if (!enableZoom)
        return;

      if (state.scale.value < 1) {
        resetZoom();
      }
      else {
        state.savedScale.value = state.scale.value;
        state.savedTranslateX.value = state.translateX.value;
        state.savedTranslateY.value = state.translateY.value;
        state.panGestureEnabled.value = state.scale.value > 1.1;
        scheduleOnRN(onSetCanSwipe, state.scale.value <= 1.1);
      }
    });
}

function createPanGesture(
  options: Pick<ZoomOptions, 'enableZoom' | 'onSetCanSwipe'>,
  state: ZoomState,
  helpers: ZoomHelpers,
) {
  const { enableZoom, onSetCanSwipe } = options;
  const { constrainTranslation } = helpers;

  return Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(state.panGestureEnabled.value)
    .onStart(() => {
      state.savedTranslateX.value = state.translateX.value;
      state.savedTranslateY.value = state.translateY.value;
      scheduleOnRN(onSetCanSwipe, false);
    })
    .onUpdate((event) => {
      if (!enableZoom || !state.panGestureEnabled.value)
        return;

      const newTranslateX = state.savedTranslateX.value + event.translationX;
      const newTranslateY = state.savedTranslateY.value + event.translationY;
      const constrained = constrainTranslation(state.scale.value, newTranslateX, newTranslateY);
      state.translateX.value = constrained.x;
      state.translateY.value = constrained.y;
    })
    .onEnd(() => {
      state.savedTranslateX.value = state.translateX.value;
      state.savedTranslateY.value = state.translateY.value;
      scheduleOnRN(onSetCanSwipe, state.scale.value <= 1.1);
    });
}

type UseImageZoomProps = {
  enableZoom: boolean;
  onSetCanSwipe: (canSwipe: boolean) => void;
  shouldReset?: boolean;
  screenWidth: number;
  screenHeight: number;
};

export function useImageZoom({
  enableZoom,
  onSetCanSwipe,
  shouldReset = false,
  screenWidth,
  screenHeight,
}: UseImageZoomProps) {
  const state: ZoomState = {
    scale: useSharedValue(1),
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    savedScale: useSharedValue(1),
    savedTranslateX: useSharedValue(0),
    savedTranslateY: useSharedValue(0),
    panGestureEnabled: useSharedValue(false),
  };

  const resetZoom = createResetZoom(state, onSetCanSwipe);
  const helpers: ZoomHelpers = {
    resetZoom,
    constrainTranslation: createConstrainTranslation(screenWidth, screenHeight),
  };

  const resetZoomRef = useRef(resetZoom);
  useEffect(() => {
    resetZoomRef.current = resetZoom;
  });

  useEffect(() => {
    if (shouldReset)
      resetZoomRef.current();
  }, [shouldReset]);

  const doubleTapGesture = createDoubleTapGesture(
    { enableZoom, onSetCanSwipe, screenWidth, screenHeight },
    state,
    helpers,
  );
  const pinchGesture = createPinchGesture(
    { enableZoom, onSetCanSwipe, screenWidth, screenHeight },
    state,
    helpers,
  );
  const panGesture = createPanGesture({ enableZoom, onSetCanSwipe }, state, helpers);

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: state.scale.value },
      { translateX: state.translateX.value },
      { translateY: state.translateY.value },
    ],
  }));

  return { animatedImageStyle, composedGesture, resetZoom };
}
