import type { MutableRefObject, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
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

export function LiveWaveform(props: LiveWaveformProps) {
  if (Platform.OS === 'web') {
    return <WebLiveWaveform {...props} />;
  }
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
      {displayData.map((value, index) => {
        const edgeFade = fadeEdges
          ? Math.min(
              1,
              Math.min(index, displayData.length - 1 - index)
              / Math.max(1, fadeWidth / gap),
            )
          : 1;
        return (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={`bar-${index}-${value.toFixed(2)}`}
            style={{
              width: barWidth,
              marginRight: index < displayData.length - 1 ? barGap : 0,
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

function teardownMicrophone({
  streamRef,
  audioContextRef,
  animationRef,
  onStreamEnd,
}: {
  streamRef: MutableRefObject<MediaStream | null>;
  audioContextRef: MutableRefObject<AudioContext | null>;
  animationRef: MutableRefObject<number>;
  onStreamEnd?: () => void;
}) {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    onStreamEnd?.();
  }
  if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = 0;
  }
}

async function setupMicrophone({
  deviceId,
  fftSize,
  smoothingTimeConstant,
  onError,
  onStreamReady,
  streamRef,
  audioContextRef,
  analyserRef,
  historyRef,
}: {
  deviceId?: string;
  fftSize: number;
  smoothingTimeConstant: number;
  onError?: (error: Error) => void;
  onStreamReady?: (stream: MediaStream) => void;
  streamRef: MutableRefObject<MediaStream | null>;
  audioContextRef: MutableRefObject<AudioContext | null>;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  historyRef: MutableRefObject<number[]>;
}) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId
        ? {
            deviceId: { exact: deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
    });
    streamRef.current = stream;
    onStreamReady?.(stream);

    const AudioContextConstructor
      = window.AudioContext
        || (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
    const audioContext = new AudioContextConstructor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothingTimeConstant;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    historyRef.current = [];
  }
  catch (error) {
    onError?.(error as Error);
  }
}

function computeProcessingBars({
  time,
  barCount,
  mode,
  lastActiveData,
  transitionProgress,
}: {
  time: number;
  barCount: number;
  mode: 'scrolling' | 'static';
  lastActiveData: number[];
  transitionProgress: number;
}): number[] {
  const processingData: number[] = [];

  if (mode === 'static') {
    const halfCount = Math.floor(barCount / 2);

    for (let i = 0; i < barCount; i++) {
      const normalizedPosition = (i - halfCount) / halfCount;
      const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
      const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25;
      const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2;
      const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15;
      const combinedWave = wave1 + wave2 + wave3;
      const processingValue = (0.2 + combinedWave) * centerWeight;

      let finalValue = processingValue;
      if (lastActiveData.length > 0 && transitionProgress < 1) {
        const lastDataIndex = Math.min(i, lastActiveData.length - 1);
        const lastValue = lastActiveData[lastDataIndex] || 0;
        finalValue
          = lastValue * (1 - transitionProgress)
            + processingValue * transitionProgress;
      }

      processingData.push(Math.max(0.05, Math.min(1, finalValue)));
    }
  }
  else {
    for (let i = 0; i < barCount; i++) {
      const normalizedPosition = (i - barCount / 2) / (barCount / 2);
      const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
      const wave1 = Math.sin(time * 1.5 + i * 0.15) * 0.25;
      const wave2 = Math.sin(time * 0.8 - i * 0.1) * 0.2;
      const wave3 = Math.cos(time * 2 + i * 0.05) * 0.15;
      const combinedWave = wave1 + wave2 + wave3;
      const processingValue = (0.2 + combinedWave) * centerWeight;

      let finalValue = processingValue;
      if (lastActiveData.length > 0 && transitionProgress < 1) {
        const lastDataIndex = Math.floor(
          (i / barCount) * lastActiveData.length,
        );
        const lastValue = lastActiveData[lastDataIndex] || 0;
        finalValue
          = lastValue * (1 - transitionProgress)
            + processingValue * transitionProgress;
      }

      processingData.push(Math.max(0.05, Math.min(1, finalValue)));
    }
  }

  return processingData;
}

function fadeWaveformToIdle({
  mode,
  staticBarsRef,
  historyRef,
  needsRedrawRef,
}: {
  mode: 'scrolling' | 'static';
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  needsRedrawRef: MutableRefObject<boolean>;
}) {
  let fadeProgress = 0;

  const step = () => {
    fadeProgress += 0.03;
    if (fadeProgress < 1) {
      if (mode === 'static') {
        staticBarsRef.current = staticBarsRef.current.map(
          value => value * (1 - fadeProgress),
        );
      }
      else {
        historyRef.current = historyRef.current.map(
          value => value * (1 - fadeProgress),
        );
      }
      needsRedrawRef.current = true;
      requestAnimationFrame(step);
    }
    else if (mode === 'static') {
      staticBarsRef.current = [];
    }
    else {
      historyRef.current = [];
    }
  };

  step();
}

function updateAnalyserData({
  width,
  mode,
  sensitivity,
  historySize,
  barWidth,
  barGap,
  analyserRef,
  staticBarsRef,
  historyRef,
  lastActiveDataRef,
}: {
  width: number;
  mode: 'scrolling' | 'static';
  sensitivity: number;
  historySize: number;
  barWidth: number;
  barGap: number;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  lastActiveDataRef: MutableRefObject<number[]>;
}) {
  if (!analyserRef.current) {
    return;
  }
  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  analyserRef.current.getByteFrequencyData(dataArray);

  const startFreq = Math.floor(dataArray.length * 0.05);
  const endFreq = Math.floor(dataArray.length * 0.4);
  const relevantData = dataArray.slice(startFreq, endFreq);

  if (mode === 'static') {
    const barCount = Math.floor(width / (barWidth + barGap));
    const halfCount = Math.floor(barCount / 2);
    const newBars: number[] = [];

    for (let i = halfCount - 1; i >= 0; i--) {
      const dataIndex = Math.floor((i / halfCount) * relevantData.length);
      const value = Math.min(1, (relevantData[dataIndex] / 255) * sensitivity);
      newBars.push(Math.max(0.05, value));
    }

    for (let i = 0; i < halfCount; i++) {
      const dataIndex = Math.floor((i / halfCount) * relevantData.length);
      const value = Math.min(1, (relevantData[dataIndex] / 255) * sensitivity);
      newBars.push(Math.max(0.05, value));
    }

    staticBarsRef.current = newBars;
    lastActiveDataRef.current = newBars;
  }
  else {
    let sum = 0;
    for (let i = 0; i < relevantData.length; i++) {
      sum += relevantData[i];
    }
    const average = (sum / relevantData.length / 255) * sensitivity;

    historyRef.current.push(Math.min(1, Math.max(0.05, average)));
    lastActiveDataRef.current = [...historyRef.current];

    if (historyRef.current.length > historySize) {
      historyRef.current.shift();
    }
  }
}

function drawWaveformBars({
  ctx,
  rect,
  mode,
  barWidth,
  barGap,
  barRadius,
  baseBarHeight,
  computedBarColor,
  staticBarsRef,
  historyRef,
}: {
  ctx: CanvasRenderingContext2D;
  rect: DOMRect;
  mode: 'scrolling' | 'static';
  barWidth: number;
  barGap: number;
  barRadius: number;
  baseBarHeight: number;
  computedBarColor: string;
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
}) {
  const step = barWidth + barGap;
  const barCount = Math.floor(rect.width / step);
  const centerY = rect.height / 2;

  if (mode === 'static') {
    const dataToRender = staticBarsRef.current;

    for (let i = 0; i < barCount && i < dataToRender.length; i++) {
      const value = dataToRender[i] || 0.1;
      const x = i * step;
      const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8);
      const y = centerY - barHeight / 2;

      ctx.fillStyle = computedBarColor;
      ctx.globalAlpha = 0.4 + value * 0.6;

      if (barRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barRadius);
        ctx.fill();
      }
      else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
  }
  else {
    for (let i = 0; i < barCount && i < historyRef.current.length; i++) {
      const dataIndex = historyRef.current.length - 1 - i;
      const value = historyRef.current[dataIndex] || 0.1;
      const x = rect.width - (i + 1) * step;
      const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8);
      const y = centerY - barHeight / 2;

      ctx.fillStyle = computedBarColor;
      ctx.globalAlpha = 0.4 + value * 0.6;

      if (barRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barRadius);
        ctx.fill();
      }
      else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
  }
}

function applyEdgeFade({
  ctx,
  rect,
  fadeEdges,
  fadeWidth,
  gradientCacheRef,
  lastWidthRef,
}: {
  ctx: CanvasRenderingContext2D;
  rect: DOMRect;
  fadeEdges: boolean;
  fadeWidth: number;
  gradientCacheRef: MutableRefObject<CanvasGradient | null>;
  lastWidthRef: MutableRefObject<number>;
}) {
  if (!fadeEdges || fadeWidth <= 0 || rect.width <= 0) {
    return;
  }
  if (!gradientCacheRef.current || lastWidthRef.current !== rect.width) {
    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
    const fadePercent = Math.min(0.3, fadeWidth / rect.width);

    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(fadePercent, 'rgba(255,255,255,0)');
    gradient.addColorStop(1 - fadePercent, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    gradientCacheRef.current = gradient;
    lastWidthRef.current = rect.width;
  }

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradientCacheRef.current;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.globalCompositeOperation = 'source-over';
}

function useCanvasResize({
  canvasRef,
  containerRef,
  gradientCacheRef,
  lastWidthRef,
  needsRedrawRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  gradientCacheRef: MutableRefObject<CanvasGradient | null>;
  lastWidthRef: MutableRefObject<number>;
  needsRedrawRef: MutableRefObject<boolean>;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // eslint-disable-next-line react-compiler/react-compiler
      gradientCacheRef.current = null;

      lastWidthRef.current = rect.width;

      needsRedrawRef.current = true;
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [canvasRef, containerRef, gradientCacheRef, lastWidthRef, needsRedrawRef]);
}

function useExternalDataSync({
  data,
  mode,
  staticBarsRef,
  historyRef,
  lastActiveDataRef,
  needsRedrawRef,
}: {
  data?: number[];
  mode: 'scrolling' | 'static';
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  lastActiveDataRef: MutableRefObject<number[]>;
  needsRedrawRef: MutableRefObject<boolean>;
}) {
  useEffect(() => {
    if (data && data.length > 0) {
      if (mode === 'static') {
        // eslint-disable-next-line react-compiler/react-compiler
        staticBarsRef.current = [...data];
      }
      else {
        historyRef.current = [...data];
      }

      lastActiveDataRef.current = [...data];

      needsRedrawRef.current = true;
    }
  }, [data, mode, staticBarsRef, historyRef, lastActiveDataRef, needsRedrawRef]);
}

function useProcessingAnimation({
  processing,
  active,
  mode,
  barWidth,
  barGap,
  containerRef,
  staticBarsRef,
  historyRef,
  lastActiveDataRef,
  transitionProgressRef,
  needsRedrawRef,
  processingAnimationRef,
}: {
  processing: boolean;
  active: boolean;
  mode: 'scrolling' | 'static';
  barWidth: number;
  barGap: number;
  containerRef: RefObject<HTMLDivElement | null>;
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  lastActiveDataRef: MutableRefObject<number[]>;
  transitionProgressRef: MutableRefObject<number>;
  needsRedrawRef: MutableRefObject<boolean>;
  processingAnimationRef: MutableRefObject<number | null>;
}) {
  useEffect(() => {
    if (processing && !active) {
      let time = 0;
      // eslint-disable-next-line react-compiler/react-compiler
      transitionProgressRef.current = 0;

      const animateProcessing = () => {
        time += 0.03;
        transitionProgressRef.current = Math.min(
          1,
          transitionProgressRef.current + 0.02,
        );

        const barCount = Math.floor(
          (containerRef.current?.getBoundingClientRect().width || 200)
          / (barWidth + barGap),
        );
        const processingData = computeProcessingBars({
          time,
          barCount,
          mode,
          lastActiveData: lastActiveDataRef.current,
          transitionProgress: transitionProgressRef.current,
        });

        if (mode === 'static') {
          staticBarsRef.current = processingData;
        }
        else {
          historyRef.current = processingData;
        }

        needsRedrawRef.current = true;
        processingAnimationRef.current
          = requestAnimationFrame(animateProcessing);
      };

      animateProcessing();

      return () => {
        if (processingAnimationRef.current) {
          cancelAnimationFrame(processingAnimationRef.current);
        }
      };
    }
    if (!active && !processing) {
      const hasData = mode === 'static'
        ? staticBarsRef.current.length > 0
        : historyRef.current.length > 0;

      if (hasData) {
        fadeWaveformToIdle({ mode, staticBarsRef, historyRef, needsRedrawRef });
      }
    }
  }, [
    processing,
    active,
    mode,
    barWidth,
    barGap,
    containerRef,
    staticBarsRef,
    historyRef,
    lastActiveDataRef,
    transitionProgressRef,
    needsRedrawRef,
    processingAnimationRef,
  ]);
}

function useMicrophoneCapture({
  active,
  data,
  deviceId,
  fftSize,
  smoothingTimeConstant,
  onError,
  onStreamReady,
  onStreamEnd,
  streamRef,
  audioContextRef,
  analyserRef,
  animationRef,
  historyRef,
}: {
  active: boolean;
  data?: number[];
  deviceId?: string;
  fftSize: number;
  smoothingTimeConstant: number;
  onError?: (error: Error) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamEnd?: () => void;
  streamRef: MutableRefObject<MediaStream | null>;
  audioContextRef: MutableRefObject<AudioContext | null>;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  animationRef: MutableRefObject<number>;
  historyRef: MutableRefObject<number[]>;
}) {
  useEffect(() => {
    const isDataDriven = !!data && data.length > 0;

    if (!active || isDataDriven) {
      teardownMicrophone({ streamRef, audioContextRef, animationRef, onStreamEnd });
      return;
    }

    setupMicrophone({
      deviceId,
      fftSize,
      smoothingTimeConstant,
      onError,
      onStreamReady,
      streamRef,
      audioContextRef,
      analyserRef,
      historyRef,
    });

    return () => teardownMicrophone({ streamRef, audioContextRef, animationRef, onStreamEnd });
  }, [
    active,
    data,
    deviceId,
    fftSize,
    smoothingTimeConstant,
    onError,
    onStreamReady,
    onStreamEnd,
    streamRef,
    audioContextRef,
    analyserRef,
    animationRef,
    historyRef,
  ]);
}

type DrawLoopParams = {
  active: boolean;
  mode: 'scrolling' | 'static';
  sensitivity: number;
  updateRate: number;
  historySize: number;
  barWidth: number;
  barGap: number;
  barRadius: number;
  baseBarHeight: number;
  barColor?: string;
  fadeEdges: boolean;
  fadeWidth: number;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  lastUpdateRef: MutableRefObject<number>;
  needsRedrawRef: MutableRefObject<boolean>;
  gradientCacheRef: MutableRefObject<CanvasGradient | null>;
  lastWidthRef: MutableRefObject<number>;
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  lastActiveDataRef: MutableRefObject<number[]>;
};

function runAnimateFrame({ currentTime, canvas, ctx, params, onRaf, getNextRafId }: {
  currentTime: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  params: DrawLoopParams;
  onRaf: (id: number) => void;
  getNextRafId: () => number;
}) {
  const {
    active,
    mode,
    sensitivity,
    updateRate,
    historySize,
    barWidth,
    barGap,
    barRadius,
    baseBarHeight,
    barColor,
    fadeEdges,
    fadeWidth,
    analyserRef,
    lastUpdateRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
    staticBarsRef,
    historyRef,
    lastActiveDataRef,
  } = params;
  const rect = canvas.getBoundingClientRect();

  if (active && currentTime - lastUpdateRef.current > updateRate) {
    lastUpdateRef.current = currentTime;
    updateAnalyserData({
      width: rect.width,
      mode,
      sensitivity,
      historySize,
      barWidth,
      barGap,
      analyserRef,
      staticBarsRef,
      historyRef,
      lastActiveDataRef,
    });

    needsRedrawRef.current = true;
  }

  if (!needsRedrawRef.current && !active) {
    onRaf(getNextRafId());
    return;
  }

  needsRedrawRef.current = active;
  ctx.clearRect(0, 0, rect.width, rect.height);

  const computedBarColor = barColor || getComputedStyle(canvas).color || '#000';
  drawWaveformBars({
    ctx,
    rect,
    mode,
    barWidth,
    barGap,
    barRadius,
    baseBarHeight,
    computedBarColor,
    staticBarsRef,
    historyRef,
  });
  applyEdgeFade({ ctx, rect, fadeEdges, fadeWidth, gradientCacheRef, lastWidthRef });
  ctx.globalAlpha = 1;
  onRaf(getNextRafId());
}

function useDrawLoop({
  canvasRef,
  ...params
}: DrawLoopParams & { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
      return;

    let rafId: number;
    const animate = (currentTime: number) => {
      runAnimateFrame({
        currentTime,
        canvas,
        ctx,
        params,
        onRaf: (id) => { rafId = id; },
        getNextRafId: () => requestAnimationFrame(animate),
      });
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId)
        cancelAnimationFrame(rafId);
    };
  }, [
    params.active,
    params.mode,
    params.sensitivity,
    params.updateRate,
    params.historySize,
    params.barWidth,
    params.barGap,
    params.barRadius,
    params.baseBarHeight,
    params.barColor,
    params.fadeEdges,
    params.fadeWidth,
    canvasRef,
    params.analyserRef,
    params.lastUpdateRef,
    params.needsRedrawRef,
    params.gradientCacheRef,
    params.lastWidthRef,
    params.staticBarsRef,
    params.historyRef,
    params.lastActiveDataRef,
    params,
  ]);
}

function useWebWaveformRefs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<number[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const processingAnimationRef = useRef<number | null>(null);
  const lastActiveDataRef = useRef<number[]>([]);
  const transitionProgressRef = useRef(0);
  const staticBarsRef = useRef<number[]>([]);
  const needsRedrawRef = useRef(true);
  const gradientCacheRef = useRef<CanvasGradient | null>(null);
  const lastWidthRef = useRef(0);
  return {
    canvasRef,
    containerRef,
    historyRef,
    analyserRef,
    audioContextRef,
    streamRef,
    animationRef,
    lastUpdateRef,
    processingAnimationRef,
    lastActiveDataRef,
    transitionProgressRef,
    staticBarsRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
  };
}

function useWebWaveformEffects(props: LiveWaveformProps, refs: ReturnType<typeof useWebWaveformRefs>) {
  const {
    active = false,
    processing = false,
    deviceId,
    data,
    barWidth = 3,
    barGap = 1,
    barRadius = 1.5,
    barColor,
    fadeEdges = true,
    fadeWidth = 24,
    barHeight: baseBarHeight = 4,
    sensitivity = 1,
    smoothingTimeConstant = 0.8,
    fftSize = 256,
    historySize = 60,
    updateRate = 30,
    mode = 'static',
    onError,
    onStreamReady,
    onStreamEnd,
  } = props;
  const {
    canvasRef,
    containerRef,
    historyRef,
    analyserRef,
    audioContextRef,
    streamRef,
    animationRef,
    lastUpdateRef,
    processingAnimationRef,
    lastActiveDataRef,
    transitionProgressRef,
    staticBarsRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
  } = refs;

  useCanvasResize({ canvasRef, containerRef, gradientCacheRef, lastWidthRef, needsRedrawRef });
  useExternalDataSync({ data, mode, staticBarsRef, historyRef, lastActiveDataRef, needsRedrawRef });
  useProcessingAnimation({
    processing,
    active,
    mode,
    barWidth,
    barGap,
    containerRef,
    staticBarsRef,
    historyRef,
    lastActiveDataRef,
    transitionProgressRef,
    needsRedrawRef,
    processingAnimationRef,
  });
  useMicrophoneCapture({
    active,
    data,
    deviceId,
    fftSize,
    smoothingTimeConstant,
    onError,
    onStreamReady,
    onStreamEnd,
    streamRef,
    audioContextRef,
    analyserRef,
    animationRef,
    historyRef,
  });
  useDrawLoop({
    active,
    mode,
    sensitivity,
    updateRate,
    historySize,
    barWidth,
    barGap,
    barRadius,
    baseBarHeight,
    barColor,
    fadeEdges,
    fadeWidth,
    canvasRef,
    analyserRef,
    lastUpdateRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
    staticBarsRef,
    historyRef,
    lastActiveDataRef,
  });
  useLivelinessInterval({ active, mode, staticBarsRef, historyRef, needsRedrawRef });
}

function useLivelinessInterval({ active, mode, staticBarsRef, historyRef, needsRedrawRef }: {
  active: boolean;
  mode: 'scrolling' | 'static';
  staticBarsRef: MutableRefObject<number[]>;
  historyRef: MutableRefObject<number[]>;
  needsRedrawRef: MutableRefObject<boolean>;
}) {
  useEffect(() => {
    if (!active)
      return;
    const interval = setInterval(() => {
      const barsRef = mode === 'static' ? staticBarsRef : historyRef;
      if (barsRef.current.length > 0) {
        // eslint-disable-next-line react-compiler/react-compiler
        barsRef.current = barsRef.current.map(value =>
          Math.max(0.08, Math.min(1, value * (0.9 + Math.random() * 0.2))),
        );

        needsRedrawRef.current = true;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [active, mode, staticBarsRef, historyRef, needsRedrawRef]);
}

function WebLiveWaveform(props: LiveWaveformProps) {
  const {
    active = false,
    processing = false,
    height = 64,
    className,
    barHeight: _barHeight,
    barWidth: _barWidth,
    barGap: _barGap,
    barRadius: _barRadius,
    barColor: _barColor,
    fadeEdges: _fadeEdges,
    fadeWidth: _fadeWidth,
    sensitivity: _sensitivity,
    smoothingTimeConstant: _smoothingTimeConstant,
    fftSize: _fftSize,
    historySize: _historySize,
    updateRate: _updateRate,
    mode: _mode,
    onError: _onError,
    onStreamReady: _onStreamReady,
    onStreamEnd: _onStreamEnd,
    deviceId: _deviceId,
    data: _data,
  } = props;
  const refs = useWebWaveformRefs();
  useWebWaveformEffects(props, refs);
  const { containerRef, canvasRef } = refs;

  return (
    <div
      className={cn('relative size-full', className)}
      ref={containerRef}
      style={{ height }}
      aria-label={
        active
          ? 'Live audio waveform'
          : processing
            ? 'Processing audio'
            : 'Audio waveform idle'
      }
      role="img"
    >
      {!active && !processing && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dotted border-muted-foreground/20" />
      )}
      <canvas
        className="block size-full"
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}
