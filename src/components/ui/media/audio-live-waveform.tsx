import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { cn } from '@/utils/utils';

export type LiveWaveformProps = {
  active?: boolean;
  processing?: boolean;
  deviceId?: string;
  data?: number[];
  mode?: 'scrolling' | 'static';
  barWidth?: number;
  barHeight?: number;
  barGap?: number;
  barRadius?: number;
  barColor?: string;
  fadeEdges?: boolean;
  fadeWidth?: number;
  height?: number;
  sensitivity?: number;
  smoothingTimeConstant?: number;
  fftSize?: number;
  historySize?: number;
  updateRate?: number;
  className?: string;
  onError?: (error: Error) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamEnd?: () => void;
};

const IDLE_BAR_COUNT = 24;
const IDLE_LEVEL = 0.18;

const MAX_WAVEFORM_BARS = 256;
const STABLE_BAR_IDS: string[] = Array.from(
  { length: MAX_WAVEFORM_BARS },
  (_, barSlot) => `waveform-bar-${barSlot}`,
);

export function LiveWaveform(props: LiveWaveformProps) {
  return <NativeLiveWaveform {...props} />;
}

function NativeBar({
  value,
  width,
  height,
  radius,
  color,
  minHeight,
}: {
  value: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  minHeight: number;
}) {
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.set(withTiming(value, { duration: 90 }));
  }, [value, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: Math.max(minHeight, progress.value * height),
  }));

  return (
    <Animated.View
      style={[
        { width, borderRadius: radius, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

function NativeLiveWaveform({
  data,
  active = false,
  barWidth = 3,
  barHeight = 4,
  barGap = 1,
  barRadius = 1.5,
  barColor,
  fadeEdges = true,
  fadeWidth = 24,
  height = 64,
  className,
}: LiveWaveformProps) {
  const primaryHex = usePrimaryHex();
  const color = barColor || primaryHex;

  const levels = (() => {
    if (data && data.length > 0) {
      return data;
    }
    if (active) {
      return Array.from({ length: IDLE_BAR_COUNT }, (_, i) =>
        0.3 + Math.abs(Math.sin(i * 0.7)) * 0.35);
    }
    return Array.from({ length: IDLE_BAR_COUNT }).fill(IDLE_LEVEL);
  })();

  const [displayData, setDisplayData] = useState<number[]>(levels as number[]);
  const [prevLevels, setPrevLevels] = useState<number[]>(levels as number[]);

  if (prevLevels !== levels) {
    setPrevLevels(levels as number[]);
    setDisplayData(levels as number[]);
  }

  // Subtle liveliness while active so the waveform reacts to playback/recording
  useEffect(() => {
    if (!active) {
      return;
    }
    const interval = setInterval(() => {
      setDisplayData(prev =>
        prev.map(value =>
          Math.max(0.08, Math.min(1, value * (0.9 + Math.random() * 0.2))),
        ),
      );
    }, 100);
    return () => clearInterval(interval);
  }, [active]);

  const gap = barWidth + barGap;
  const totalWidth = displayData.length * barWidth
    + (displayData.length - 1) * barGap;

  return (
    <View
      className={cn('flex-row items-center', className)}
      style={{ height, width: totalWidth }}
      accessibilityLabel={active ? 'Live audio waveform' : 'Audio waveform idle'}
    >
      {displayData.map((value, barSlot) => {
        const edgeFade = fadeEdges
          ? Math.min(
              1,
              Math.min(barSlot, displayData.length - 1 - barSlot)
              / Math.max(1, fadeWidth / gap),
            )
          : 1;
        return (
          <View
            key={STABLE_BAR_IDS[barSlot]}
            style={{
              width: barWidth,
              marginRight: barSlot < displayData.length - 1 ? barGap : 0,
              opacity: 0.4 + edgeFade * 0.6,
            }}
          >
            <NativeBar
              value={value}
              width={barWidth}
              height={height}
              radius={barRadius}
              color={color}
              minHeight={barHeight}
            />
          </View>
        );
      })}
    </View>
  );
}
