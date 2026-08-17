import type { AudioSource } from 'expo-audio';
import type { ViewStyle } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Pause, Play, RotateCcw, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Text } from '../text';
import { LiveWaveform } from './audio-live-waveform';

function createWaveformData(): number[] {
  return Array.from({ length: 60 }, (_, i) => {
    // Create more varied and realistic waveform pattern
    const base1 = Math.sin((i / 60) * Math.PI * 6) * 0.4 + 0.5;
    const base2 = Math.sin((i / 60) * Math.PI * 2.5) * 0.3 + 0.4;
    const noise = (Math.random() - 0.5) * 0.25;
    const peak = Math.random() < 0.15 ? Math.random() * 0.4 : 0; // Occasional peaks
    return Math.max(0.15, Math.min(0.95, (base1 + base2) / 2 + noise + peak));
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function usePlaybackStatus(
  player: ReturnType<typeof useAudioPlayer>,
  onPlaybackStatusUpdate?: (status: any) => void,
) {
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const seekToPosition = (newPosition: number) => {
    if (player.isLoaded && duration > 0) {
      const clampedPosition = Math.max(0, Math.min(duration, newPosition));
      player.seekTo(clampedPosition);
      setPosition(clampedPosition);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.isLoaded) {
        const currentTime = player.currentTime || 0;
        const totalDuration = player.duration || 0;

        setDuration(totalDuration);
        setPosition(currentTime);

        // Check if the audio finished
        if (currentTime >= totalDuration && totalDuration > 0) {
          player.seekTo(0);
          player.pause(); // Ensure it's paused
        }

        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate({
            isLoaded: player.isLoaded,
            playing: player.playing,
            duration: totalDuration,
            position: currentTime,
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, onPlaybackStatusUpdate]);

  return { duration, position, seekToPosition };
}

type WaveformSectionProps = {
  data: number[];
  isPlaying: boolean;
  activeColor: string;
};

function WaveformSection({
  data,
  isPlaying,
  activeColor,
}: WaveformSectionProps) {
  return (
    <View className="mb-2.5 items-center">
      <LiveWaveform
        data={data}
        active={isPlaying}
        mode="static"
        height={82}
        barWidth={4}
        barGap={1.5}
        barColor={activeColor}
      />
    </View>
  );
}

function ProgressBarSection({ progress }: { progress: number }) {
  return (
    <View className="mb-3.5 h-1 overflow-hidden rounded-full bg-secondary">
      <View
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </View>
  );
}

type PlaybackControlsProps = {
  isLoaded: boolean;
  isPlaying: boolean;
  textColor: string;
  onPlayPause: () => void;
  onBackFiveSeconds: () => void;
  onRestart: () => void;
};

function PlaybackControls({
  isLoaded,
  isPlaying,
  textColor,
  onPlayPause,
  onBackFiveSeconds,
  onRestart,
}: PlaybackControlsProps) {
  return (
    <View className="mb-2 flex-row items-center justify-center gap-3.5">
      <Pressable
        accessibilityLabel="Rewind 5 seconds"
        disabled={!isLoaded}
        onPress={onBackFiveSeconds}
        className="size-10 items-center justify-center rounded-full bg-secondary"
        style={({ pressed }) => [
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <RotateCcw size={18} color={textColor} />
      </Pressable>

      <Pressable
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        disabled={!isLoaded}
        onPress={onPlayPause}
        className="size-14 items-center justify-center rounded-full bg-primary"
        style={({ pressed }) => [
          { opacity: pressed ? 0.82 : 1 },
        ]}
      >
        {isPlaying
          ? <Pause size={24} color="white" />
          : <Play size={24} color="white" />}
      </Pressable>

      <Pressable
        accessibilityLabel="Restart"
        disabled={!isLoaded}
        onPress={onRestart}
        className="size-10 items-center justify-center rounded-full bg-secondary"
        style={({ pressed }) => [
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Square fill={textColor} size={18} color={textColor} />
      </Pressable>
    </View>
  );
}

type TimerSectionProps = {
  position: number;
  duration: number;
  mutedColor: string;
};

function TimerSection({ position, duration, mutedColor }: TimerSectionProps) {
  return (
    <View className="items-center">
      <Text variant="caption" style={{ color: mutedColor }}>
        {formatTime(position)}
        {' '}
        /
        {formatTime(duration)}
      </Text>
    </View>
  );
}

function LoadingSection({ mutedColor }: { mutedColor: string }) {
  return (
    <View className="items-center pt-2">
      <Text variant="caption" style={{ color: mutedColor }}>
        Loading audio...
      </Text>
    </View>
  );
}

export type AudioPlayerProps = {
  source: AudioSource;
  style?: ViewStyle;
  /** Which sections to render. Omitted sections default to visible. */
  show?: {
    controls?: boolean;
    waveform?: boolean;
    timer?: boolean;
    progressBar?: boolean;
  };
  autoPlay?: boolean;
  bordered?: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
};

export function AudioPlayer({
  source,
  style,
  show,
  autoPlay = false,
  bordered = true,
  onPlaybackStatusUpdate,
}: AudioPlayerProps) {
  const showControls = show?.controls ?? true;
  const showWaveform = show?.waveform ?? true;
  const showTimer = show?.timer ?? true;
  const showProgressBar = show?.progressBar ?? true;
  const player = useAudioPlayer(source);
  const { duration, position, seekToPosition } = usePlaybackStatus(player, onPlaybackStatusUpdate);
  const [waveformData] = useState<number[]>(createWaveformData);

  // Theme colors
  const { text: textColor, muted: mutedColor } = useThemeColors();
  const primaryHex = usePrimaryHex();

  useEffect(() => {
    if (autoPlay && player.isLoaded && !player.playing) {
      player.play();
    }
  }, [autoPlay, player, player.isLoaded]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    }
    else {
      player.play();
    }
  };

  const handleBackFiveSeconds = () => {
    seekToPosition(Math.max(0, position - 5));
  };

  const handleRestart = () => {
    seekToPosition(0);
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View
      className={cn(
        'w-[328px] self-center px-3.5 py-4',
        bordered && 'rounded-md border border-border bg-card',
      )}
      style={style}
    >
      {showWaveform && (
        <WaveformSection
          data={waveformData}
          isPlaying={player.playing}
          activeColor={primaryHex}
        />
      )}

      {showProgressBar && (
        <ProgressBarSection progress={progressPercentage} />
      )}

      {showControls && (
        <PlaybackControls
          isLoaded={player.isLoaded}
          isPlaying={player.playing}
          textColor={textColor}
          onPlayPause={handlePlayPause}
          onBackFiveSeconds={handleBackFiveSeconds}
          onRestart={handleRestart}
        />
      )}

      {showTimer && (
        <TimerSection position={position} duration={duration} mutedColor={mutedColor} />
      )}

      {!player.isLoaded && (
        <LoadingSection mutedColor={mutedColor} />
      )}
    </View>
  );
}
