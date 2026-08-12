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

import { Button } from './button';
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
  show?: { pages?: boolean; titles?: boolean; descriptions?: boolean };
  enable?: { fullscreen?: boolean; zoom?: boolean; download?: boolean; share?: boolean };
  onItemPress?: (item: GalleryItem, index: number) => void;
  onDownload?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  renderCustomOverlay?: (item: GalleryItem, index: number) => React.ReactNode;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

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

  const imageContainer = (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={{ width: screenWidth, height: screenHeight }}
    >
      <AnimatedImage
        source={{ uri: item.uri }}
        style={[{ width: screenWidth, height: screenHeight }, animatedImageStyle]}
        contentFit="contain"
      />
    </Animated.View>
  );

  return (
    <View
      className="items-center justify-center"
      style={{ width: screenWidth, height: screenHeight, backgroundColor }}
    >
      {enableZoom
        ? (
            <GestureDetector gesture={composedGesture}>
              {imageContainer}
            </GestureDetector>
          )
        : (
            imageContainer
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
  backgroundColor,
  renderCustomOverlay,
  onItemPress,
}: GalleryGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth);
  const { muted: mutedColor, text: textColor } = useThemeColors();

  const itemWidth = Math.max(
    1,
    (containerWidth - paddingHorizontal * 2 - spacing * (columns - 1)) / columns,
  );

  const renderItem = ({ item, index }: { item: GalleryItem; index: number }) => (
    <Pressable
      style={{ width: itemWidth, borderRadius }}
      onPress={() => onItemPress(item, index)}
    >
      <View
        style={{
          width: itemWidth,
          height: itemWidth * aspectRatio,
          borderRadius,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: item.thumbnail || item.uri }}
          style={{ height: '100%', width: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>

      {renderCustomOverlay?.(item, index)}

      {(showTitles || showDescriptions) && (
        <View className="p-2">
          {showTitles && item.title && (
            <Text
              variant="bodyLarge"
              className="font-semibold"
              numberOfLines={1}
              style={{ color: textColor }}
            >
              {item.title}
            </Text>
          )}
          {showDescriptions && item.description && (
            <Text variant="caption" numberOfLines={2} style={{ color: mutedColor }}>
              {item.description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );

  return (
    <FlatList
      key={`gallery-${columns}`}
      data={items}
      numColumns={columns}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      className="flex-1"
      style={{ backgroundColor }}
      contentContainerStyle={{
        gap: spacing,
        paddingHorizontal,
        paddingVertical: paddingHorizontal,
      }}
      columnWrapperStyle={columns > 1 ? { gap: spacing } : undefined}
      showsVerticalScrollIndicator={false}
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    />
  );
}

type ThumbnailStripProps = {
  items: GalleryItem[];
  selectedIndex: number;
  flatListRef: React.RefObject<FlatList<GalleryItem> | null>;
  onThumbnailPress: (index: number) => void;
  primaryHex: string;
};

function ThumbnailStrip({ items, selectedIndex, flatListRef, onThumbnailPress, primaryHex }: ThumbnailStripProps) {
  return (
    <FlatList
      ref={flatListRef}
      data={items}
      renderItem={({ item, index }) => (
        <Pressable
          className="size-10 overflow-hidden rounded-lg border border-transparent"
          style={
            selectedIndex === index
              ? {
                  borderColor: primaryHex,
                  borderWidth: 2,
                }
              : undefined
          }
          onPress={() => onThumbnailPress(index)}
        >
          <Image
            source={{ uri: item.thumbnail || item.uri }}
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
  thumbnailFlatListRef: React.RefObject<FlatList<GalleryItem> | null>;
  onThumbnailPress: (index: number) => void;
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
  backgroundColor,
  mutedColor,
  textColor,
  primaryHex,
}: FullscreenControlsProps) {
  const insets = useSafeAreaInsets();
  const currentItem = items[selectedIndex] ?? null;

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4 pb-4"
        style={{ backgroundColor, paddingTop: insets.top + 12 }}
      >
        <View className="flex-row gap-2">
          {enableDownload && onDownload && (
            <Button
              title="Download"
              iconOnly
              variant="ghost"
              leftIconComponent={Download}
              onPress={() => currentItem && onDownload(currentItem)}
            />
          )}
          {enableShare && onShare && (
            <Button
              title="Share"
              iconOnly
              variant="ghost"
              leftIconComponent={Share}
              onPress={() => currentItem && onShare(currentItem)}
            />
          )}
        </View>

        <Button
          title="Close"
          iconOnly
          variant="ghost"
          leftIconComponent={X}
          size="lg"
          onPress={onClose}
        />
      </View>

      <View
        className="absolute inset-x-0 bottom-0 p-4"
        style={{ backgroundColor, paddingBottom: insets.bottom + 16 }}
      >
        {showPages && (
          <Text variant="caption" style={{ textAlign: 'center', marginBottom: 8, color: mutedColor }}>
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
            className="font-semibold"
            style={{ textAlign: 'center', marginBottom: 8, color: textColor }}
            numberOfLines={1}
          >
            {currentItem.title}
          </Text>
        )}

        {currentItem?.description && (
          <Text
            variant="caption"
            style={{ textAlign: 'center', marginBottom: 16, color: mutedColor }}
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
          primaryHex={primaryHex}
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
  const fullscreenFlatListRef = useRef<FlatList<GalleryItem>>(null);
  const thumbnailFlatListRef = useRef<FlatList<GalleryItem>>(null);

  useEffect(() => {
    if (initialIndex < 0)
      return;
    const timeout = setTimeout(() => {
      fullscreenFlatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      thumbnailFlatListRef.current?.scrollToIndex({ index: initialIndex, animated: false, viewPosition: 0.5 });
    }, 100);
    return () => clearTimeout(timeout);
  }, [initialIndex]);

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    setFlatListScrollEnabled(true);
    fullscreenFlatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length === 0)
      return;
    const newIndex = viewableItems[0].index;
    if (newIndex === null || newIndex === undefined)
      return;
    setSelectedIndex(newIndex);
    setTimeout(() => {
      thumbnailFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0.5 });
    }, 100);
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

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderFullscreenItem = ({ item, index }: { item: GalleryItem; index: number }) => (
    <FullscreenImage
      key={`fullscreen-${item.id}`}
      item={item}
      index={index}
      selectedIndex={selectedIndex}
      enableZoom={enable.zoom}
      onSetCanSwipe={setFlatListScrollEnabled}
      screenWidth={screenWidth}
      screenHeight={screenHeight}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor }}>
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

      <FullscreenControls
        items={items}
        selectedIndex={selectedIndex}
        showPages={show.pages}
        enableDownload={enable.download}
        enableShare={enable.share}
        onDownload={onDownload}
        onShare={onShare}
        onClose={onClose}
        thumbnailFlatListRef={thumbnailFlatListRef}
        onThumbnailPress={handleThumbnailPress}
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
  const { background: backgroundColor, muted: mutedColor } = useThemeColors();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    <GestureHandlerRootView className="flex-1">
      <GalleryGrid
        items={items}
        columns={columns}
        spacing={spacing}
        paddingHorizontal={paddingHorizontal}
        aspectRatio={aspectRatio}
        borderRadius={borderRadius}
        showTitles={showTitles}
        showDescriptions={showDescriptions}
        backgroundColor={backgroundColor}
        renderCustomOverlay={renderCustomOverlay}
        onItemPress={handleItemPress}
      />

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeFullscreen}>
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
    </GestureHandlerRootView>
  );
}
