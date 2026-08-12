import type { SharedValue } from 'react-native-reanimated';
import { Download, Share, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Image } from './image';
import { Text } from './text';

export type GalleryItem = {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  thumbnail?: string;
};

type GalleryProps = {
  items: GalleryItem[];
  columns?: number;
  spacing?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  aspectRatio?: number;
  /** Which details to render. Omitted options default to hidden. */
  show?: {
    pages?: boolean;
    titles?: boolean;
    descriptions?: boolean;
  };
  /** Which capabilities to enable. Omitted options default to their built-in state. */
  enable?: {
    fullscreen?: boolean;
    zoom?: boolean;
    download?: boolean;
    share?: boolean;
  };
  onItemPress?: (item: GalleryItem, index: number) => void;
  onDownload?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  renderCustomOverlay?: (item: GalleryItem, index: number) => React.ReactNode;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

const MIN_SCALE = 0.8;
const MAX_SCALE = 4;

type ZoomState = {
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  savedScale: SharedValue<number>;
  savedTranslateX: SharedValue<number>;
  savedTranslateY: SharedValue<number>;
  panGestureEnabled: SharedValue<boolean>;
};

type ZoomGestureHelpers = {
  resetZoom: () => void;
  constrainTranslation: (
    scale: number,
    x: number,
    y: number,
  ) => { x: number; y: number };
};

type ZoomOptions = {
  enableZoom: boolean;
  onSetCanSwipe: (canSwipe: boolean) => void;
  screenWidth: number;
  screenHeight: number;
};

function createDoubleTapGesture(
  options: ZoomOptions,
  state: ZoomState,
  helpers: ZoomGestureHelpers,
) {
  const { enableZoom, screenWidth, screenHeight, onSetCanSwipe } = options;
  const { resetZoom, constrainTranslation } = helpers;

  return Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (!enableZoom)
        return;

      // If already zoomed in (beyond a small threshold), reset to original size
      if (state.scale.value > 1.1) {
        resetZoom();
      }
      else {
        const targetScale = 2.5;
        const tapX = event.x - screenWidth / 2;
        const tapY = event.y - screenHeight / 2;
        const newTranslateX = (-tapX * (targetScale - 1)) / targetScale;
        const newTranslateY = (-tapY * (targetScale - 1)) / targetScale;
        const constrained = constrainTranslation(
          targetScale,
          newTranslateX,
          newTranslateY,
        );

        state.scale.value = withSpring(targetScale, { damping: 20, stiffness: 300 });
        state.translateX.value = withSpring(constrained.x, {
          damping: 20,
          stiffness: 300,
        });
        state.translateY.value = withSpring(constrained.y, {
          damping: 20,
          stiffness: 300,
        });
        state.savedScale.value = targetScale;
        state.savedTranslateX.value = constrained.x;
        state.savedTranslateY.value = constrained.y;
        scheduleOnRN(onSetCanSwipe, false);
        state.panGestureEnabled.value = true;
      }
    });
}

function createPinchGesture(
  options: ZoomOptions,
  state: ZoomState,
  helpers: ZoomGestureHelpers,
) {
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

      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, state.savedScale.value * event.scale),
      );
      const focalX = event.focalX - screenWidth / 2;
      const focalY = event.focalY - screenHeight / 2;
      const scaleDiff = newScale / state.savedScale.value;
      const newTranslateX = state.savedTranslateX.value + focalX * (1 - scaleDiff);
      const newTranslateY = state.savedTranslateY.value + focalY * (1 - scaleDiff);
      const constrained = constrainTranslation(
        newScale,
        newTranslateX,
        newTranslateY,
      );

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
  helpers: ZoomGestureHelpers,
) {
  const { enableZoom, onSetCanSwipe } = options;
  const { constrainTranslation } = helpers;

  return Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(state.panGestureEnabled.value)
    .onStart(() => {
      'worklet';
      state.savedTranslateX.value = state.translateX.value;
      state.savedTranslateY.value = state.translateY.value;
      scheduleOnRN(onSetCanSwipe, false);
    })
    .onUpdate((event) => {
      'worklet';
      if (!enableZoom || !state.panGestureEnabled.value)
        return;
      const newTranslateX = state.savedTranslateX.value + event.translationX;
      const newTranslateY = state.savedTranslateY.value + event.translationY;
      const constrained = constrainTranslation(
        state.scale.value,
        newTranslateX,
        newTranslateY,
      );
      state.translateX.value = constrained.x;
      state.translateY.value = constrained.y;
    })
    .onEnd(() => {
      'worklet';
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

// eslint-disable-next-line react-refresh/only-export-components
export function useImageZoom({
  enableZoom,
  onSetCanSwipe,
  shouldReset = false,
  screenWidth,
  screenHeight,
}: UseImageZoomProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const panGestureEnabled = useSharedValue(false);

  const state: ZoomState = { scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY, panGestureEnabled };

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    scheduleOnRN(onSetCanSwipe, true);
    panGestureEnabled.value = false;
  };

  // resetZoom is a worklet recreated every render, so the effect calls the
  // latest instance through a ref instead of depending on its identity.
  const resetZoomRef = useRef(resetZoom);
  useEffect(() => {
    resetZoomRef.current = resetZoom;
  });

  useEffect(() => {
    if (shouldReset) {
      resetZoomRef.current();
    }
  }, [shouldReset]);

  const constrainTranslation = (newScale: number, newTranslateX: number, newTranslateY: number) => {
    'worklet';
    const maxTranslateX = Math.max(
      0,
      (screenWidth * newScale - screenWidth) / 2,
    );
    const maxTranslateY = Math.max(
      0,
      (screenHeight * newScale - screenHeight) / 2,
    );
    const constrainedX = Math.max(
      -maxTranslateX,
      Math.min(maxTranslateX, newTranslateX),
    );
    const constrainedY = Math.max(
      -maxTranslateY,
      Math.min(maxTranslateY, newTranslateY),
    );
    return { x: constrainedX, y: constrainedY };
  };

  const helpers: ZoomGestureHelpers = { resetZoom, constrainTranslation };

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
  const panGesture = createPanGesture(
    { enableZoom, onSetCanSwipe },
    state,
    helpers,
  );

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return {
    animatedImageStyle,
    composedGesture,
    resetZoom,
  };
}

type FullscreenImageProps = {
  item: GalleryItem;
  index: number;
  selectedIndex: number;
  enableZoom: boolean;
  onSetCanSwipe: (canSwipe: boolean) => void;
  screenWidth: number;
  screenHeight: number;
};

function FullscreenImage({
  item,
  index,
  selectedIndex,
  enableZoom,
  onSetCanSwipe,
  screenWidth,
  screenHeight,
}: FullscreenImageProps) {
  const shouldReset = index === selectedIndex;
  const { background: backgroundColor } = useThemeColors();
  const { animatedImageStyle, composedGesture } = useImageZoom({
    enableZoom,
    onSetCanSwipe,
    shouldReset,
    screenWidth,
    screenHeight,
  });

  return (
    <View
      className="items-center justify-center"
      style={{
        width: screenWidth,
        height: screenHeight,
        backgroundColor,
      }}
    >
      {enableZoom
        ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                className="flex-1 items-center justify-center"
                style={{ width: screenWidth, height: screenHeight }}
              >
                <AnimatedImage
                  source={{ uri: item.uri }}
                  style={[
                    { width: screenWidth, height: screenHeight },
                    animatedImageStyle,
                  ]}
                  contentFit="contain"
                />
              </Animated.View>
            </GestureDetector>
          )
        : (
            <Animated.View
              className="flex-1 items-center justify-center"
              style={{ width: screenWidth, height: screenHeight }}
            >
              <AnimatedImage
                source={{ uri: item.uri }}
                style={[
                  { width: screenWidth, height: screenHeight },
                  animatedImageStyle,
                ]}
                contentFit="contain"
              />
            </Animated.View>
          )}
    </View>
  );
}

type GalleryGridProps = {
  items: GalleryItem[];
  columns: number;
  spacing: number;
  paddingHorizontal: number;
  aspectRatio: number;
  borderRadius: number;
  showTitles: boolean;
  showDescriptions: boolean;
  textColor: string;
  mutedColor: string;
  backgroundColor: string;
  renderCustomOverlay?: (item: GalleryItem, index: number) => React.ReactNode;
  onItemPress: (item: GalleryItem, index: number) => void;
};

function GalleryGrid({
  items,
  columns,
  spacing,
  paddingHorizontal,
  aspectRatio,
  borderRadius,
  showTitles,
  showDescriptions,
  textColor,
  mutedColor,
  backgroundColor,
  renderCustomOverlay,
  onItemPress,
}: GalleryGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth);
  const itemWidth = Math.max(
    1,
    (containerWidth - paddingHorizontal * 2 - spacing * (columns - 1)) / columns,
  );

  const renderItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const isLastInRow = (index + 1) % columns === 0;
    const hasCaption = showTitles || showDescriptions;

    return (
      <Pressable
        key={item.id}
        style={{
          width: itemWidth,
          borderRadius,
          marginRight: isLastInRow ? 0 : spacing,
          marginBottom: spacing,
        }}
        onPress={() => onItemPress(item, index)}
      >
        <Image
          source={{ uri: item.thumbnail || item.uri }}
          style={{
            width: itemWidth,
            height: itemWidth * aspectRatio,
            borderRadius,
          }}
          contentFit="cover"
          transition={200}
        />

        {renderCustomOverlay && renderCustomOverlay(item, index)}

        {hasCaption && (
          <View style={{ paddingTop: 8, paddingHorizontal: 4, paddingBottom: 4 }}>
            {showTitles && item.title && (
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                className="font-semibold"
                style={{ color: textColor }}
              >
                {item.title}
              </Text>
            )}
            {showDescriptions && item.description && (
              <Text
                variant="caption"
                numberOfLines={2}
                style={{ color: mutedColor, marginTop: 2 }}
              >
                {item.description}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        backgroundColor,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        paddingHorizontal,
      }}
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    >
      {items.map((item, index) => renderItem({ item, index }))}
    </View>
  );
}

type ThumbnailStripProps = {
  items: GalleryItem[];
  selectedIndex: number;
  flatListRef: React.RefObject<FlatList | null>;
  onThumbnailPress: (index: number) => void;
};

function ThumbnailStrip({
  items,
  selectedIndex,
  flatListRef,
  onThumbnailPress,
}: ThumbnailStripProps) {
  return (
    <FlatList
      ref={flatListRef}
      data={items}
      renderItem={({ item, index }) => (
        <Pressable
          className={cn(
            'size-10 overflow-hidden rounded-lg border',
            selectedIndex === index && 'border-primary',
          )}
          style={selectedIndex === index && { borderWidth: 2 }}
          onPress={() => onThumbnailPress(index)}
        >
          <Image
            source={{ uri: item.thumbnail || item.uri }}
            className="size-full"
            style={{ height: '100%', width: '100%' }}
            contentFit="cover"
          />
        </Pressable>
      )}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
      ItemSeparatorComponent={() => <View className="w-2" />}
      getItemLayout={(data, index) => ({
        length: 48,
        offset: 56 * index,
        index,
      })}
    />
  );
}

type FullscreenControlsProps = {
  items: GalleryItem[];
  selectedIndex: number;
  showPages: boolean;
  enableDownload: boolean;
  enableShare: boolean;
  onDownload?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  onClose: () => void;
  thumbnailFlatListRef: React.RefObject<FlatList | null>;
  onThumbnailPress: (index: number) => void;
  insets: { top: number; bottom: number };
  backgroundColor: string;
  mutedColor: string;
  textColor: string;
  primaryHex: string;
};

function FullscreenControls({
  items,
  selectedIndex,
  showPages,
  enableDownload,
  enableShare,
  onDownload,
  onShare,
  onClose,
  thumbnailFlatListRef,
  onThumbnailPress,
  insets,
  backgroundColor,
  mutedColor,
  textColor,
  primaryHex,
}: FullscreenControlsProps) {
  const currentItem = items[selectedIndex] ?? null;

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      {/* Top controls (share, download, close) */}
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4 pb-4"
        style={{ backgroundColor, paddingTop: insets.top + 12 }}
      >
        <View className="flex-row gap-2">
          {enableDownload && onDownload && (
            <Pressable
              accessibilityLabel="Download image"
              onPress={() => currentItem && onDownload(currentItem)}
              className="size-10 items-center justify-center rounded-full bg-secondary"
            >
              <Download size={20} color={primaryHex} />
            </Pressable>
          )}
          {enableShare && onShare && (
            <Pressable
              accessibilityLabel="Share image"
              onPress={() => currentItem && onShare(currentItem)}
              className="size-10 items-center justify-center rounded-full bg-secondary"
            >
              <Share size={20} color={primaryHex} />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityLabel="Close fullscreen"
          onPress={onClose}
          className="size-10 items-center justify-center rounded-full bg-secondary"
        >
          <X size={22} color={primaryHex} />
        </Pressable>
      </View>

      {/* Bottom controls (page, title, description, thumbnails) */}
      <View
        className="absolute inset-x-0 bottom-0 p-4"
        style={{ backgroundColor, paddingBottom: insets.bottom + 16 }}
      >
        {showPages && (
          <Text
            variant="caption"
            className="mb-2 text-center"
            style={{ color: mutedColor }}
          >
            {selectedIndex + 1}
            {' '}
            of
            {' '}
            {items.length}
          </Text>
        )}

        {currentItem?.title && (
          <Text
            variant="bodyLarge"
            className="mb-2 text-center font-semibold"
            style={{ color: textColor }}
            numberOfLines={1}
          >
            {currentItem.title}
          </Text>
        )}

        {currentItem?.description && (
          <Text
            variant="caption"
            className="mb-4 text-center"
            style={{ color: mutedColor }}
            numberOfLines={2}
          >
            {currentItem.description}
          </Text>
        )}

        <ThumbnailStrip
          items={items}
          selectedIndex={selectedIndex}
          flatListRef={thumbnailFlatListRef}
          onThumbnailPress={onThumbnailPress}
        />
      </View>
    </View>
  );
}

type FullscreenViewerProps = {
  items: GalleryItem[];
  initialIndex: number;
  screenWidth: number;
  screenHeight: number;
  enable: { zoom: boolean; download: boolean; share: boolean };
  show: { pages: boolean };
  onDownload?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  onClose: () => void;
  backgroundColor: string;
};

function useFullscreenViewerState(initialIndex: number) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [flatListScrollEnabled, setFlatListScrollEnabled] = useState(true);
  const fullscreenFlatListRef = useRef<FlatList>(null);
  const thumbnailFlatListRef = useRef<FlatList>(null);

  // Scroll to the initially selected image once the modal has rendered
  useEffect(() => {
    if (initialIndex < 0) {
      return;
    }
    const timeout = setTimeout(() => {
      fullscreenFlatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      thumbnailFlatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [initialIndex]);

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    setFlatListScrollEnabled(true);
    fullscreenFlatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  // Stable callback for onViewableItemsChanged — RN warns if it changes on the fly.
  // Deps are empty: setSelectedIndex and thumbnailFlatListRef are stable across renders.
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setSelectedIndex(newIndex);
        setTimeout(() => {
          thumbnailFlatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      }
    }
  };

  return {
    selectedIndex,
    flatListScrollEnabled,
    setFlatListScrollEnabled,
    fullscreenFlatListRef,
    thumbnailFlatListRef,
    handleThumbnailPress,
    onViewableItemsChanged,
  };
}

function FullscreenViewer({
  items,
  initialIndex,
  screenWidth,
  screenHeight,
  enable,
  show,
  onDownload,
  onShare,
  onClose,
  backgroundColor,
}: FullscreenViewerProps) {
  const { zoom: enableZoom, download: enableDownload, share: enableShare } = enable;
  const { pages: showPages } = show;
  const insets = useSafeAreaInsets();
  const { muted: mutedColor, text: textColor } = useThemeColors();
  const primaryHex = usePrimaryHex();
  const {
    selectedIndex,
    flatListScrollEnabled,
    setFlatListScrollEnabled,
    fullscreenFlatListRef,
    thumbnailFlatListRef,
    handleThumbnailPress,
    onViewableItemsChanged,
  } = useFullscreenViewerState(initialIndex);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderFullscreenItem = ({ item, index }: { item: GalleryItem; index: number }) => (
    <FullscreenImage
      key={`fullscreen-${item.id}`}
      item={item}
      index={index}
      selectedIndex={selectedIndex}
      enableZoom={enableZoom}
      onSetCanSwipe={setFlatListScrollEnabled}
      screenWidth={screenWidth}
      screenHeight={screenHeight}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <GestureHandlerRootView>
        <FlatList
          ref={fullscreenFlatListRef}
          data={items}
          renderItem={renderFullscreenItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          scrollEnabled={flatListScrollEnabled}
          removeClippedSubviews={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={21}
        />
      </GestureHandlerRootView>

      <FullscreenControls
        items={items}
        selectedIndex={selectedIndex}
        showPages={showPages}
        enableDownload={enableDownload}
        enableShare={enableShare}
        onDownload={onDownload}
        onShare={onShare}
        onClose={onClose}
        thumbnailFlatListRef={thumbnailFlatListRef}
        onThumbnailPress={handleThumbnailPress}
        insets={insets}
        backgroundColor={backgroundColor}
        mutedColor={mutedColor}
        textColor={textColor}
        primaryHex={primaryHex}
      />
    </View>
  );
}

export function Gallery({
  items,
  columns = 4,
  spacing = 0,
  paddingHorizontal = 0,
  aspectRatio = 1,
  borderRadius = 0,
  show,
  enable,
  onItemPress,
  onDownload,
  onShare,
  renderCustomOverlay,
}: GalleryProps) {
  const showPages = show?.pages ?? false;
  const showTitles = show?.titles ?? false;
  const showDescriptions = show?.descriptions ?? false;
  const enableFullscreen = enable?.fullscreen ?? true;
  const enableZoom = enable?.zoom ?? true;
  const enableDownload = enable?.download ?? false;
  const enableShare = enable?.share ?? false;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    background: backgroundColor,
    muted: mutedColor,
    text: textColor,
  } = useThemeColors();

  const openFullscreen = (index: number) => {
    if (!enableFullscreen)
      return;
    setSelectedIndex(index);
    setIsModalVisible(true);
  };

  const closeFullscreen = () => {
    setIsModalVisible(false);
    setSelectedIndex(-1);
  };

  const handleItemPress = (item: GalleryItem, index: number) => {
    if (onItemPress) {
      onItemPress(item, index);
    }
    else if (enableFullscreen) {
      openFullscreen(index);
    }
  };

  if (items.length === 0) {
    return (
      <View className="m-4 flex-1 items-center justify-center rounded-xl p-8">
        <Text variant="body" style={{ color: mutedColor }}>
          No images to display
        </Text>
      </View>
    );
  }

  return (
    <>
      <GalleryGrid
        items={items}
        columns={columns}
        spacing={spacing}
        paddingHorizontal={paddingHorizontal}
        aspectRatio={aspectRatio}
        borderRadius={borderRadius}
        showTitles={showTitles}
        showDescriptions={showDescriptions}
        textColor={textColor}
        mutedColor={mutedColor}
        backgroundColor={backgroundColor}
        renderCustomOverlay={renderCustomOverlay}
        onItemPress={handleItemPress}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <FullscreenViewer
          items={items}
          initialIndex={selectedIndex}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          enable={{ zoom: enableZoom, download: enableDownload, share: enableShare }}
          show={{ pages: showPages }}
          onDownload={onDownload}
          onShare={onShare}
          onClose={closeFullscreen}
          backgroundColor={backgroundColor}
        />
      </Modal>
    </>
  );
}
