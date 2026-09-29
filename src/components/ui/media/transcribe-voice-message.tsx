import type { AudioSource } from 'expo-audio';
import type { ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import {
  MessageCircle,
  Pause,
  Play,
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

import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { AnimatedNumber } from '../number-flow';

export type TranscribeVoiceMessageProps = {
  /**
   * Audio duration in seconds.
   */
  duration: number;

  /**
   * Text displayed inside the transcription bubble.
   */
  transcription: string;

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
   * Optional initial playback position.
   */
  initialTime?: number;

  /**
   * Controlled current playback time.
   */
  currentTime?: number;

  /**
   * Optional controlled playing state.
   */
  playing?: boolean;

  /**
   * Called whenever playback position changes.
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
   * Optional custom NativeWind classes.
   */
  className?: string;

  /**
   * Optional native style.
   */
  style?: ViewStyle;
};

type WaveformBar = {
  height: number;
  id: string;
};

const DEFAULT_WAVEFORM = [
  8,
  12,
  16,
  12,
  10,
  18,
  24,
  16,
  14,
  20,
  12,
  16,
  22,
  18,
  14,
  10,
  16,
  24,
  18,
  14,
  12,
  10,
  8,
  12,
  16,
  14,
  10,
];

const TICK_MS = 100;
const TICK_SECONDS = TICK_MS / 1000;

/** Tight, fast settle — the bubble should land without overshoot. */
const BUBBLE_SPRING = { damping: 25, stiffness: 400 };

function clamp(value: number, min: number, max: number) {
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
  TranscribeVoiceMessageProps,
  'duration' | 'onFinish' | 'onPause' | 'onPlay' | 'onTimeChange' | 'source'
> & { controlledTime?: number; initialTime: number };

/**
 * Owns the playback clock. With a `source` the expo-audio player is the source
 * of truth; without one a `setInterval` drives a simulated clock.
 */
// eslint-disable-next-line max-lines-per-function
function usePlayback({
  controlledTime,
  duration,
  initialTime,
  onFinish,
  onPause,
  onPlay,
  onTimeChange,
  source,
}: PlaybackOptions) {
  const [internalTime, setInternalTime] = useState(initialTime);
  const [internalPlaying, setInternalPlaying] = useState(false);

  // The player hook must be called unconditionally.
  const player = useAudioPlayer(source ?? null);
  const status = useAudioPlayerStatus(player);

  const hasSource = source != null;
  const isControlledTime = controlledTime !== undefined;

  // Prefer the loaded audio duration, fall back to the prop.
  const playbackDuration = hasSource
    ? (status.duration > 0 ? status.duration : duration)
    : duration;

  const currentTime
    = controlledTime ?? (hasSource ? status.currentTime : internalTime);

  const isPlaying = hasSource ? status.playing : internalPlaying;
  const isDone = currentTime >= playbackDuration;

  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const updateTime = (time: number) => {
    const nextTime = clamp(time, 0, playbackDuration);

    currentTimeRef.current = nextTime;

    if (hasSource) {
      player.seekTo(nextTime);
    }
    else if (!isControlledTime) {
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
      setInternalPlaying(false);
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

    const interval = setInterval(onTick, TICK_MS);

    return () => {
      clearInterval(interval);
    };
  }, [hasSource, isPlaying]);

  const togglePlay = () => {
    if (isDone) {
      if (hasSource) {
        player.seekTo(0);
        player.play();
      }
      else {
        updateTime(0);
        setInternalPlaying(true);
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

    setInternalPlaying(next);
  };

  const progress = playbackDuration > 0
    ? clamp(currentTime / playbackDuration, 0, 1)
    : 0;

  const remainingTime = Math.max(
    0,
    Math.ceil(playbackDuration - currentTime),
  );

  return { isPlaying, progress, remainingTime, togglePlay };
}

/* ================================================================
   TRANSCRIPTION BUBBLE
================================================================ */

function TranscriptionBubble({
  bubbleProgress,
  transcription,
}: {
  bubbleProgress: SharedValue<number>;
  transcription: string;
}) {
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleProgress.value,
    transform: [
      { translateY: interpolate(bubbleProgress.value, [0, 1], [8, 0]) },
      { scale: interpolate(bubbleProgress.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute bottom-full left-0 z-20 mb-2"
      style={bubbleStyle}
    >
      <View className="relative">
        <View
          className="border-border bg-card w-65 overflow-hidden rounded-2xl border p-4 sm:w-70 sm:rounded-[28px] sm:px-6 sm:py-5"
          style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
        >
          <Text className="text-foreground text-sm/6 font-bold sm:text-lg">
            {transcription}
          </Text>
        </View>

        {/* Speech bubble connector */}
        <View className="absolute -bottom-9 left-4 items-center gap-1.5">
          <View
            className="bg-card ml-3 size-3.5 rounded-full sm:size-4"
            style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
          />

          <View
            className="bg-card size-1.5 rounded-full sm:size-2"
            style={{ boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)' }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

/* ================================================================
   PLAYER PILL
================================================================ */

type PlayerPillProps = {
  bars: WaveformBar[];
  isPlaying: boolean;
  mutedColor: string;
  onTogglePlay: () => void;
  primaryHex: string;
  progress: SharedValue<number>;
  remainingTime: number;
  textColor: string;
};

function PlayerPill({
  bars,
  isPlaying,
  mutedColor,
  onTogglePlay,
  primaryHex,
  progress,
  remainingTime,
  textColor,
}: PlayerPillProps) {
  const foregroundStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      className="border-border bg-card flex-row items-center gap-2 rounded-full border px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
      style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04)' }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        onPress={onTogglePlay}
        className="size-8 items-center justify-center"
      >
        <Animated.View
          key={isPlaying ? 'pause' : 'play'}
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(100)}
        >
          {isPlaying
            ? <Pause size={23} color={textColor} fill={textColor} strokeWidth={2} />
            : <Play size={23} color={textColor} fill={textColor} strokeWidth={2} />}
        </Animated.View>
      </Pressable>

      {/* Waveform */}
      <View className="relative h-8 flex-row items-center gap-0.5 sm:h-10 sm:gap-[3.5px]">
        {bars.map(({ height, id }) => (
          <View
            key={id}
            className="w-0.5 rounded-full sm:w-1"
            style={{ height, backgroundColor: mutedColor }}
          />
        ))}

        <Animated.View
          pointerEvents="none"
          className="absolute inset-y-0 left-0 flex-row items-center gap-0.5 overflow-hidden sm:gap-[3.5px]"
          style={foregroundStyle}
        >
          <View className="flex-row items-center gap-0.5 sm:gap-[3.5px]">
            {bars.map(({ height, id }) => (
              <View
                key={id}
                className="w-0.5 shrink-0 rounded-full sm:w-1"
                style={{ height, backgroundColor: primaryHex }}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Timer */}
      <View className="h-5 w-9 flex-row items-center justify-end">
        <AnimatedNumber
          value={remainingTime}
          style={{
            color: mutedColor,
            fontSize: 12,
            fontVariant: ['tabular-nums'],
            fontWeight: '700',
          }}
        />

        <Text className="text-muted-foreground text-xs font-bold sm:text-base">
          s
        </Text>
      </View>
    </View>
  );
}

/* ================================================================
   ROOT
================================================================ */

export function TranscribeVoiceMessage({
  duration,
  transcription,
  waveformHeights = DEFAULT_WAVEFORM,
  source,

  initialTime = 0,
  currentTime: controlledTime,

  onTimeChange,
  onPlay,
  onPause,
  onFinish,

  className,
  style,
}: TranscribeVoiceMessageProps) {
  const [showTranscription, setShowTranscription] = useState(false);

  const bars = toBars(waveformHeights);

  const { muted, text } = useThemeColors();
  const primaryHex = usePrimaryHex();

  const { isPlaying, progress, remainingTime, togglePlay } = usePlayback({
    controlledTime,
    duration,
    initialTime,
    onFinish,
    onPause,
    onPlay,
    onTimeChange,
    source,
  });

  const animatedProgress = useSharedValue(progress);
  const bubbleProgress = useSharedValue(showTranscription ? 1 : 0);

  useEffect(() => {
    animatedProgress.set(withTiming(progress, { duration: 100 }));
  }, [progress, animatedProgress]);

  useEffect(() => {
    bubbleProgress.set(withSpring(showTranscription ? 1 : 0, BUBBLE_SPRING));
  }, [showTranscription, bubbleProgress]);

  return (
    <View
      className={cn('w-full items-center justify-center p-2 sm:p-4', className)}
      style={style}
    >
      <View className="relative w-full flex-row items-center justify-center gap-2 sm:gap-4">
        <View className="relative shrink-0">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle transcription"
            onPress={() => setShowTranscription(previous => !previous)}
            className={cn(
              'size-11 items-center justify-center rounded-full sm:size-16',
              showTranscription
                ? 'border-primary bg-primary/10 border-2'
                : 'bg-muted border-0',
            )}
          >
            <MessageCircle
              size={24}
              color={showTranscription ? primaryHex : text}
              fill={showTranscription ? primaryHex : 'transparent'}
              strokeWidth={1.5}
            />
          </Pressable>

          {showTranscription && (
            <TranscriptionBubble
              bubbleProgress={bubbleProgress}
              transcription={transcription}
            />
          )}
        </View>

        <PlayerPill
          bars={bars}
          isPlaying={isPlaying}
          mutedColor={muted}
          onTogglePlay={togglePlay}
          primaryHex={primaryHex}
          progress={animatedProgress}
          remainingTime={remainingTime}
          textColor={text}
        />
      </View>
    </View>
  );
}
