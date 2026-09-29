import type { AudioSource } from 'expo-audio';
import type { LayoutChangeEvent } from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';

import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import {
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react-native';

import React, {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { AnimatedNumber } from '../number-flow';

export type WaveformScrubProps = {
  /**
   * Total duration in seconds.
   */
  duration?: number;

  /**
   * Displayed audio file name.
   */
  fileName?: string;

  /**
   * Real audio source (local asset or remote URL).
   * When provided, playback is driven by expo-audio
   * instead of the simulated clock.
   */
  source?: AudioSource | null;

  /**
   * Waveform bar heights.
   */
  waveformHeights?: number[];

  /**
   * Initial playback position.
   */
  initialTime?: number;

  /**
   * Controlled playback position.
   */
  currentTime?: number;

  /**
   * Called when playback position changes.
   */
  onTimeChange?: (time: number) => void;

  /**
   * Called when playback starts.
   */
  onPlay?: () => void;

  /**
   * Called when playback pauses.
   */
  onPause?: () => void;

  /**
   * Called when playback finishes.
   */
  onFinish?: () => void;

  /**
   * Whether the component should start playing.
   */
  autoPlay?: boolean;

  /**
   * Custom container style.
   */
  className?: string;
};

type WaveformBar = {
  height: number;
  id: string;
};

const DEFAULT_WAVEFORM = [
  4,
  7,
  9,
  6,
  11,
  14,
  12,
  8,
  5,
  10,
  15,
  13,
  11,
  9,
  6,
  10,
  12,
  9,
  7,
  5,
  8,
  12,
  10,
  7,
  6,
  9,
  13,
  11,
  8,
  6,
  5,
  11,
  8,
  6,
  5,
  11,
  8,
  6,
  5,
  8,
  5,
  10,
  15,
  13,
  11,
  9,
];

const TRACK_HEIGHT = 68;
const TICK_MS = 100;
const TICK_SECONDS = TICK_MS / 1000;

// Shared by the JS thread and the scrub worklet, so it must be workletizable.
function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function toBars(heights: number[]): WaveformBar[] {
  return heights.map((height, position) => ({
    height,
    id: `${height}-${position}`,
  }));
}

/* ================================================================
   PLAYBACK
================================================================ */

type PlaybackOptions = Pick<
  WaveformScrubProps,
  'autoPlay' | 'duration' | 'onFinish' | 'onPause' | 'onPlay' | 'onTimeChange' | 'source'
> & { controlledTime?: number; initialTime: number };

/**
 * Owns the playback clock. With a `source` the expo-audio player is the source
 * of truth; without one a `setInterval` drives a simulated clock.
 */
// eslint-disable-next-line max-lines-per-function
function useWaveformPlayback({
  autoPlay = false,
  controlledTime,
  duration = 30,
  initialTime,
  onFinish,
  onPause,
  onPlay,
  onTimeChange,
  source,
}: PlaybackOptions) {
  const [internalTime, setInternalTime] = useState(initialTime);
  const [isPlayingState, setIsPlayingState] = useState(autoPlay);

  // The player hook must be called unconditionally.
  const player = useAudioPlayer(source ?? null);
  const status = useAudioPlayerStatus(player);

  const hasSource = source != null;
  const isControlled = controlledTime !== undefined;

  // Prefer the loaded audio duration, fall back to the prop.
  const playbackDuration = hasSource
    ? (status.duration > 0 ? status.duration : duration)
    : duration;

  const currentTime
    = controlledTime ?? (hasSource ? status.currentTime : internalTime);

  const isFinished = currentTime >= playbackDuration;

  const isPlaying = hasSource
    ? status.playing
    : isPlayingState && !isFinished;

  // Read by the scrub handlers, which must not re-create on every tick.
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (hasSource && autoPlay && status.isLoaded && !status.playing) {
      player.play();
    }
  }, [autoPlay, hasSource, player, status.isLoaded, status.playing]);

  const updateTime = (time: number) => {
    const nextTime = clamp(time, 0, playbackDuration);

    currentTimeRef.current = nextTime;

    if (hasSource) {
      player.seekTo(nextTime);
    }
    else if (!isControlled) {
      setInternalTime(nextTime);
    }

    onTimeChange?.(nextTime);
  };

  // An Effect Event so the interval is not torn down and rebuilt every tick
  // just because `updateTime` or the parent's `onFinish` changed identity.
  const onTick = useEffectEvent(() => {
    const nextTime = currentTimeRef.current + TICK_SECONDS;

    if (nextTime >= playbackDuration) {
      updateTime(playbackDuration);
      setIsPlayingState(false);
      onFinish?.();
      return;
    }

    updateTime(nextTime);
  });

  // With expo-audio the player status supplies the current time.
  useEffect(() => {
    if (hasSource || !isPlaying) {
      return;
    }

    const timer = setInterval(onTick, TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [hasSource, isPlaying]);

  const togglePlay = () => {
    if (isFinished) {
      if (hasSource) {
        player.seekTo(0);
        player.play();
      }
      else {
        updateTime(0);
        setIsPlayingState(true);
      }

      onPlay?.();
      return;
    }

    if (hasSource) {
      if (isPlaying) {
        player.pause();
        onPause?.();
      }
      else {
        player.play();
        onPlay?.();
      }

      return;
    }

    // Notify outside the updater: React may invoke an updater twice in
    // StrictMode, which would fire onPlay/onPause more than once per tap.
    const next = !isPlaying;

    if (next) {
      onPlay?.();
    }
    else {
      onPause?.();
    }

    setIsPlayingState(next);
  };

  const pauseForScrub = () => {
    if (!isPlayingRef.current) {
      return;
    }

    if (hasSource) {
      player.pause();
    }
    else {
      setIsPlayingState(false);
    }

    onPause?.();
  };

  return {
    currentTime,
    isFinished,
    isPlaying,
    pauseForScrub,
    playbackDuration,
    togglePlay,
    updateTime,
  };
}

/* ================================================================
   SCRUB GESTURE
================================================================ */

/**
 * Scrubbing runs on the UI thread via gesture-handler; `PanResponder`
 * dispatches every move through the JS thread and stutters when it is busy.
 * The touch-down position is anchored on `onBegin` so the drag tracks the
 * finger instead of compounding each update onto the already-seeked time.
 */
function useScrubGesture({
  onScrubStart,
  onScrubTo,
  width,
}: {
  onScrubStart: () => void;
  onScrubTo: (x: number) => void;
  width: number;
}) {
  const anchor = useSharedValue(0);

  return Gesture.Pan()
    .onBegin((event) => {
      const start = clamp(event.x, 0, width);

      anchor.value = start;
      scheduleOnRN(onScrubStart);
      scheduleOnRN(onScrubTo, start);
    })
    .onUpdate((event) => {
      scheduleOnRN(onScrubTo, clamp(anchor.value + event.translationX, 0, width));
    });
}

/* ================================================================
   HEADER
================================================================ */

type WaveformHeaderProps = {
  displayTime: number;
  fileName: string;
  isFinished: boolean;
  isPlaying: boolean;
  mutedColor: string;
  onTogglePlay: () => void;
  textColor: string;
};

function PlaybackIcon({
  isFinished,
  isPlaying,
  color,
}: {
  isFinished: boolean;
  isPlaying: boolean;
  color: string;
}) {
  if (isFinished) {
    return <RotateCcw size={22} color={color} strokeWidth={2.5} />;
  }

  if (isPlaying) {
    return <Pause size={22} color={color} strokeWidth={3} fill={color} />;
  }

  return <Play size={22} color={color} strokeWidth={2.5} fill={color} />;
}

function WaveformHeader({
  displayTime,
  fileName,
  isFinished,
  isPlaying,
  mutedColor,
  onTogglePlay,
  textColor,
}: WaveformHeaderProps) {
  return (
    <View className="mb-4 flex-row items-center justify-between px-2 pr-4">
      <View className="flex-1 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          onPress={onTogglePlay}
          hitSlop={10}
          className="size-7 items-center justify-center"
        >
          <Animated.View
            key={isFinished ? 'reset' : isPlaying ? 'pause' : 'play'}
            entering={FadeIn.duration(180).springify()}
            exiting={FadeOut.duration(100)}
          >
            <PlaybackIcon
              isFinished={isFinished}
              isPlaying={isPlaying}
              color={textColor}
            />
          </Animated.View>
        </Pressable>

        <Text
          numberOfLines={1}
          className="text-foreground flex-1 text-[17px] font-normal tracking-tight sm:text-[19px]"
        >
          {fileName}
        </Text>
      </View>

      <View className="ml-3 flex-row items-baseline">
        <AnimatedNumber
          value={displayTime}
          style={{
            color: mutedColor,
            fontSize: 18,
            fontVariant: ['tabular-nums'],
            fontWeight: '600',
          }}
        />

        <Text className="text-muted-foreground text-[18px] font-semibold sm:text-[20px]">
          s
        </Text>
      </View>
    </View>
  );
}

/* ================================================================
   TRACK
================================================================ */

function WaveformBars({ bars, color }: { bars: WaveformBar[]; color: string }) {
  return (
    <>
      {bars.map(({ height, id }) => (
        <View
          key={id}
          className="w-1 shrink-0 rounded-full"
          style={{
            height: height * 1.6,
            backgroundColor: color,
          }}
        />
      ))}
    </>
  );
}

type WaveformTrackProps = {
  bars: WaveformBar[];
  gesture: PanGesture;
  isDark: boolean;
  mutedColor: string;
  onWaveformLayout: (event: LayoutChangeEvent) => void;
  primaryHex: string;
  progress: SharedValue<number>;
  stripeOffset: SharedValue<number>;
  waveformWidth: number;
};

// The stripes, bar rows, and scrubber all key off the same progress value.
// eslint-disable-next-line max-lines-per-function
function WaveformTrack({
  bars,
  gesture,
  isDark,
  mutedColor,
  onWaveformLayout,
  primaryHex,
  progress,
  stripeOffset,
  waveformWidth,
}: WaveformTrackProps) {
  const progressStyle = useAnimatedStyle(() => ({
    width: waveformWidth * progress.value,
  }));

  const scrubberStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * waveformWidth }],
  }));

  const stripeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stripeOffset.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        className="border-border bg-muted relative items-center justify-center overflow-hidden rounded-3xl border"
        style={{
          height: TRACK_HEIGHT,
          boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Progress stripes */}
        <Animated.View
          pointerEvents="none"
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={[
            {
              backgroundColor: primaryHex,
              opacity: isDark ? 0.1 : 0.06,
            },
            progressStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: waveformWidth + 10,
              },
              stripeStyle,
            ]}
          >
            <View
              className="h-full"
              style={{
                backgroundColor: primaryHex,
                opacity: 0.15,
              }}
            />
          </Animated.View>
        </Animated.View>

        {/* Waveform */}
        <View className="relative mx-2 h-7 w-full" onLayout={onWaveformLayout}>
          <View className="absolute inset-0 flex-row items-center justify-between">
            <WaveformBars bars={bars} color={mutedColor} />
          </View>

          <Animated.View
            pointerEvents="none"
            className="absolute inset-y-0 left-0 z-10 overflow-hidden"
            style={progressStyle}
          >
            <View
              className="h-full flex-row items-center justify-between"
              style={{ width: waveformWidth }}
            >
              <WaveformBars bars={bars} color={primaryHex} />
            </View>
          </Animated.View>

          {/* Scrubber */}
          <Animated.View
            pointerEvents="none"
            className="absolute -bottom-16 z-20 h-40 w-5.5 items-center"
            style={[{ left: -10 }, scrubberStyle]}
          >
            <View
              className="h-4.5 w-5.5 rounded-[6px]"
              style={{
                backgroundColor: primaryHex,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
              }}
            />

            <View
              className="w-1 flex-1 rounded-b-full"
              style={{
                backgroundColor: primaryHex,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
}

/* ================================================================
   TRACK ANIMATION
================================================================ */

/**
 * Drives the progress fill and the marching stripes from the playback clock.
 */
function useWaveformAnimation({
  currentTime,
  isPlaying,
  playbackDuration,
}: {
  currentTime: number;
  isPlaying: boolean;
  playbackDuration: number;
}) {
  const progress = useSharedValue(
    playbackDuration > 0 ? currentTime / playbackDuration : 0,
  );
  const stripeOffset = useSharedValue(0);

  useEffect(() => {
    const nextProgress = playbackDuration > 0
      ? clamp(currentTime / playbackDuration, 0, 1)
      : 0;

    progress.set(withTiming(nextProgress, {
      duration: 120,
      easing: Easing.out(Easing.ease),
    }));
  }, [currentTime, playbackDuration, progress]);

  useEffect(() => {
    if (!isPlaying) {
      stripeOffset.set(withTiming(0, { duration: 150 }));
      return;
    }

    stripeOffset.set(withRepeat(
      withTiming(4, { duration: 500, easing: Easing.linear }),
      -1,
      false,
    ));
  }, [isPlaying, stripeOffset]);

  return { progress, stripeOffset };
}

/* ================================================================
   ROOT
================================================================ */

export function WaveformScrub({
  duration = 30,
  fileName = 'Mom.mp3',
  waveformHeights = DEFAULT_WAVEFORM,
  source,

  initialTime = 0,
  currentTime: controlledTime,

  onTimeChange,
  onPlay,
  onPause,
  onFinish,

  autoPlay = false,
  className,
}: WaveformScrubProps) {
  const [waveformWidth, setWaveformWidth] = useState(0);
  const waveformWidthRef = useRef(0);

  const bars = toBars(waveformHeights);

  const { isDark, muted, text } = useThemeColors();
  const primaryHex = usePrimaryHex();

  const {
    currentTime,
    isFinished,
    isPlaying,
    pauseForScrub,
    playbackDuration,
    togglePlay,
    updateTime,
  } = useWaveformPlayback({
    autoPlay,
    controlledTime,
    duration,
    initialTime,
    onFinish,
    onPause,
    onPlay,
    onTimeChange,
    source,
  });

  const { progress, stripeOffset } = useWaveformAnimation({
    currentTime,
    isPlaying,
    playbackDuration,
  });

  const scrubTo = (x: number) => {
    const width = waveformWidthRef.current;

    if (width <= 0 || playbackDuration <= 0) {
      return;
    }

    updateTime((clamp(x, 0, width) / width) * playbackDuration);
  };

  const gesture = useScrubGesture({
    onScrubStart: pauseForScrub,
    onScrubTo: scrubTo,
    width: waveformWidth,
  });

  const handleWaveformLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    setWaveformWidth(width);
    waveformWidthRef.current = width;
  };

  const displayTime = Math.max(
    0,
    Math.round(playbackDuration - currentTime),
  );

  return (
    <View className={cn('w-full px-4', className)}>
      <View
        className="border-border bg-card w-full rounded-3xl border px-2 pt-4 pb-3"
        style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)' }}
      >
        <WaveformHeader
          displayTime={displayTime}
          fileName={fileName}
          isFinished={isFinished}
          isPlaying={isPlaying}
          mutedColor={muted}
          onTogglePlay={togglePlay}
          textColor={text}
        />

        <WaveformTrack
          bars={bars}
          gesture={gesture}
          isDark={isDark}
          mutedColor={muted}
          onWaveformLayout={handleWaveformLayout}
          primaryHex={primaryHex}
          progress={progress}
          stripeOffset={stripeOffset}
          waveformWidth={waveformWidth}
        />
      </View>
    </View>
  );
}
