import type { SharedValue } from 'react-native-reanimated';

import { Map, X } from 'lucide-react-native';
import React, {
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { Button, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { isWeb } from '@/utils/platform';

type ViewOnMapProps = {
  locationName?: string;
  address?: string;
  mapImageUrl?: string;
  className?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING_CONFIG = {
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const BUTTON_WIDTH = 180;
const BUTTON_HEIGHT = 52;
const MAP_SIZE = Math.min(SCREEN_WIDTH - 64, 380);

/**
 * Matches the --radius-md token in global.css (9px).
 */
const RADIUS_MD = 9;

/**
 * Some Android WebViews never report load events for the
 * Google Maps embed. Clear the spinner after this timeout
 * regardless so the card can never get stuck "loading".
 */
const MAP_LOAD_TIMEOUT = 8000;

const MAP_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 5,
};

/* ============================================================
   MAP URL
============================================================ */

function getMapUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  const publicMapUrl = `https://www.google.com/maps?q=${encodedAddress}&z=16&output=embed`;

  const openInMaps = () => {
    Linking.openURL(`https://www.google.com/maps?q=${encodedAddress}`).catch(() => {});
  };

  return {
    publicMapUrl,
    openInMaps,
  };
}

/* ============================================================
   USE MAP LOAD TIMEOUT
============================================================ */

/**
 * Some Android WebViews never report load events for the
 * Google Maps embed. Clear the spinner after a timeout
 * regardless so the card can never get stuck "loading".
 */
function useMapLoadTimeout(
  isOpen: boolean,
  onTimeout: () => void,
) {
  // An Effect Event so a fresh `onTimeout` identity cannot restart the timer
  // on every render, which would stop it from ever firing.
  const fire = useEffectEvent(onTimeout);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(fire, MAP_LOAD_TIMEOUT);

    return () =>
      clearTimeout(timer);
  }, [isOpen]);
}

/* ============================================================
   USE MAP CONTAINER STYLE
============================================================ */

/**
 * Container animation.
 *
 * This replaces Motion's layoutId animation.
 */
function useMapContainerStyle(
  progress: SharedValue<number>,
) {
  return useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [BUTTON_WIDTH, MAP_SIZE],
    );

    const height = interpolate(
      progress.value,
      [0, 1],
      [BUTTON_HEIGHT, MAP_SIZE],
    );

    const borderRadius = interpolate(
      progress.value,
      [0, 1],
      [BUTTON_HEIGHT / 2, RADIUS_MD],
    );

    return {
      width,
      height,
      borderRadius,
    };
  });
}

// The animated open/closed states share one small state machine and are kept together.
// eslint-disable-next-line max-lines-per-function
export function ViewOnMap({
  locationName,
  address = 'Boston Public Garden',
  mapImageUrl = 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop',
  className,
}: ViewOnMapProps) {
  const {
    text,
    muted,
    card,
    isDark,
  } = useThemeColors();

  const [isOpen, setIsOpen]
    = useState(false);
  const [isMapLoaded, setIsMapLoaded]
    = useState(false);
  const [hasMapError, setHasMapError]
    = useState(false);

  /**
   * 0 = closed
   * 1 = expanded
   */
  const progress = useSharedValue(0);

  const { publicMapUrl, openInMaps }
    = getMapUrl(address);

  const handleMapLoad = () => setIsMapLoaded(true);

  const handleMapError = () => {
    setIsMapLoaded(true);
    setHasMapError(true);
  };

  /**
   * Timeout fallback so the spinner never blocks forever.
   */
  useMapLoadTimeout(isOpen, handleMapLoad);

  const toggleOpen = () => {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (!nextOpen) {
      setIsMapLoaded(false);
      setHasMapError(false);
    }

    progress.set(withSpring(
      nextOpen ? 1 : 0,
      SPRING_CONFIG,
    ));
  };

  /**
   * Container animation.
   *
   * This replaces Motion's layoutId animation.
   */
  const containerAnimatedStyle
    = useMapContainerStyle(progress);

  return (
    <View
      className={cn(
        'w-full items-center justify-center px-4',
        className,
      )}
    >
      <Animated.View
        className="relative overflow-hidden bg-muted"
        style={[
          MAP_SHADOW,
          containerAnimatedStyle,
        ]}
      >
        {isOpen
          ? (
              <MapExpanded
                url={publicMapUrl}
                progress={progress}
                locationName={locationName}
                address={address}
                isDark={isDark}
                isLoaded={isMapLoaded}
                hasError={hasMapError}
                card={card}
                text={text}
                muted={muted}
                onLoad={handleMapLoad}
                onError={handleMapError}
                onClose={toggleOpen}
                onOpenInMaps={openInMaps}
              />
            )
          : (
              <MapButton
                imageUrl={mapImageUrl}
                locationName={locationName}
                progress={progress}
                isDark={isDark}
                text={text}
                muted={muted}
                onPress={toggleOpen}
              />
            )}
      </Animated.View>
    </View>
  );
}

/**
 * Closed state: the pill button.
 */
type MapButtonProps = {
  imageUrl: string;
  locationName?: string;
  progress: ReturnType<
    typeof useSharedValue<number>
  >;
  isDark: boolean;
  text: string;
  muted: string;
  onPress: () => void;
};

function MapButton({
  imageUrl,
  locationName,
  progress,
  isDark,
  text,
  muted,
  onPress,
}: MapButtonProps) {
  /**
   * Button content fades out as the map expands.
   */
  const buttonContentStyle
    = useAnimatedStyle(() => ({
      opacity: interpolate(
        progress.value,
        [0, 0.4],
        [1, 0],
      ),
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [1, 0.92],
          ),
        },
      ],
    }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="View location on map"
      className="size-full flex-1 items-center justify-center overflow-hidden"
    >
      {/* Background preview */}
      <View className="absolute inset-0 opacity-20">
        <MapPreview imageUrl={imageUrl} />
      </View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          },
          buttonContentStyle,
        ]}
      >
        <Map
          size={20}
          color={isDark ? text : muted}
          strokeWidth={2.5}
        />

        <Text
          className="text-lg font-semibold text-foreground"
          style={{ letterSpacing: -0.3 }}
        >
          {locationName ?? 'View on Map'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Expanded state: live map + fallbacks.
 */
type MapExpandedProps = {
  url: string;
  progress: ReturnType<
    typeof useSharedValue<number>
  >;
  locationName?: string;
  address: string;
  isDark: boolean;
  isLoaded: boolean;
  hasError: boolean;
  card: string;
  text: string;
  muted: string;
  onLoad: () => void;
  onError: () => void;
  onClose: () => void;
  onOpenInMaps: () => void;
};

function MapExpanded({
  url,
  progress,
  locationName,
  address,
  isDark,
  isLoaded,
  hasError,
  card,
  text,
  muted,
  onLoad,
  onError,
  onClose,
  onOpenInMaps,
}: MapExpandedProps) {
  /**
   * Map fades in after expansion.
   */
  const mapContentStyle
    = useAnimatedStyle(() => ({
      opacity: interpolate(
        progress.value,
        [0.55, 1],
        [0, 1],
      ),
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0.5, 1],
            [0.96, 1],
          ),
        },
      ],
    }));

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[
        {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 10,
        },
        mapContentStyle,
      ]}
    >
      <MapEmbed
        url={url}
        onLoad={onLoad}
        onError={onError}
      />

      {!isLoaded && !hasError && (
        <MapLoadingOverlay muted={muted} />
      )}

      {hasError && (
        <MapErrorFallback
          locationName={locationName}
          address={address}
          onOpenInMaps={onOpenInMaps}
        />
      )}

      {/* Close button */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close map"
        style={({ pressed }) => [
          {
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 50,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            backgroundColor: card,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          },
          pressed && {
            transform: [{ scale: 0.9 }],
          },
        ]}
      >
        <X
          size={22}
          color={isDark ? text : muted}
          strokeWidth={3}
        />
      </Pressable>
    </Animated.View>
  );
}

/**
 * Small map preview.
 *
 * React Native does not support CSS backgroundImage.
 * We use Image instead.
 */
type MapPreviewProps = {
  imageUrl: string;
};

function MapPreview({
  imageUrl,
}: MapPreviewProps) {
  return (
    <Animated.Image
      source={{ uri: imageUrl }}
      resizeMode="cover"
      style={{
        width: '100%',
        height: '100%',
        opacity: 0.9,
      }}
      blurRadius={0.5}
    />
  );
}

/**
 * Platform-safe map embed.
 *
 * react-native-webview has no web implementation — the
 * web bundle resolves to a "not supported" stub. On web
 * we render a plain iframe instead, which the Google
 * Maps embed URL supports natively.
 */
type MapEmbedProps = {
  url: string;
  onLoad: () => void;
  onError: () => void;
};

function MapEmbed({
  url,
  onLoad,
  onError,
}: MapEmbedProps) {
  if (isWeb) {
    return (
      <iframe
        src={url}
        title="Map"
        onLoad={onLoad}
        onError={onError}
        referrerPolicy="no-referrer-when-downgrade"
        // Deliberately omits `allow-same-origin`: paired with `allow-scripts` it
        // lets a frame drop its own sandbox. Scripts + popups are what the embed
        // needs to draw tiles and hand off to the Maps app.
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    );
  }

  return (
    <MapWebView
      url={url}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

/**
 * Native Google Maps WebView.
 */
type MapWebViewProps = {
  url: string;
  onLoad: () => void;
  onError: () => void;
};

function MapWebView({
  url,
  onLoad,
  onError,
}: MapWebViewProps) {
  const { card } = useThemeColors();

  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>*{margin:0;padding:0;box-sizing:border-box}html,body,iframe{width:100%;height:100%;border:none;overflow:hidden}</style></head><body><iframe src="${url}" frameborder="0" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></body></html>`;

  return (
    <WebView
      source={{ html }}
      onLoadEnd={onLoad}
      onError={onError}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState={false}
      allowsFullscreenVideo
      scrollEnabled={false}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: card,
      }}
    />
  );
}

/**
 * Loading overlay while the embed loads.
 */
type MapLoadingOverlayProps = {
  muted: string;
};

function MapLoadingOverlay({
  muted,
}: MapLoadingOverlayProps) {
  return (
    <View
      className="absolute inset-0 items-center justify-center bg-muted"
      pointerEvents="none"
    >
      <ActivityIndicator
        size="large"
        color={muted}
      />
    </View>
  );
}

/**
 * Shown when the embed fails to load — guarantees the
 * user still gets a usable result.
 */
type MapErrorFallbackProps = {
  locationName?: string;
  address: string;
  onOpenInMaps: () => void;
};

function MapErrorFallback({
  locationName,
  address,
  onOpenInMaps,
}: MapErrorFallbackProps) {
  return (
    <View className="absolute inset-0 items-center justify-center gap-3 bg-card px-6">
      <Text className="text-center text-lg font-semibold">
        {locationName ?? 'View on Map'}
      </Text>

      <Text className="text-center text-sm text-muted-foreground">
        {address}
      </Text>

      <Button
        title="Open in Google Maps"
        variant="primary"
        size="sm"
        onPress={onOpenInMaps}
      />
    </View>
  );
}
