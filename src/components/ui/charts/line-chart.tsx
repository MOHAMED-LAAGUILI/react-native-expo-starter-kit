import type { ComponentProps } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PathAnimatedProps = ComponentProps<typeof AnimatedPath>['animatedProps'];

type ChartConfig = {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  interactive?: boolean;
  showYLabels?: boolean;
  yLabelCount?: number;
  yAxisWidth?: number;
};

export type ChartDataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

type ChartPoint = { x: number; y: number };

type ChartLayout = {
  chartWidth: number;
  height: number;
  padding: number;
  leftPadding: number;
  chartHeight: number;
};

type ChartPalette = { primary: string; muted: string };

function createPath(points: ChartPoint[]): string {
  if (points.length === 0)
    return '';

  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];

    const cpx = (prevPoint.x + currentPoint.x) / 2;
    const cpy = prevPoint.y;

    path += ` Q${cpx},${cpy} ${currentPoint.x},${currentPoint.y}`;
  }

  return path;
}

function createAreaPath(points: ChartPoint[], height: number): string {
  if (points.length === 0)
    return '';

  let path = createPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  path += ` L${lastPoint.x},${height} L${firstPoint.x},${height} Z`;

  return path;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

type AnimatedPointProps = {
  x: number;
  y: number;
  color: string;
  index: number;
  animationProgress: SharedValue<number>;
};

function AnimatedPoint({ x, y, color, index, animationProgress }: AnimatedPointProps) {
  const pointAnimatedProps = useAnimatedProps(() => ({
    opacity: animationProgress.value,
    r: withDelay(index * 50, withSpring(animationProgress.value * 4)),
  }));

  return (
    <AnimatedCircle cx={x} cy={y} fill={color} animatedProps={pointAnimatedProps} />
  );
}

function findNearestPointIndex(points: ChartPoint[], x: number): number {
  'worklet';
  if (points.length === 0)
    return 0;

  let nearest = 0;
  let minDistance = Math.abs(points[0].x - x);
  for (let i = 1; i < points.length; i++) {
    const distance = Math.abs(points[i].x - x);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = i;
    }
  }
  return nearest;
}

function buildYAxisLabels(opts: {
  yLabelCount: number;
  showYLabels: boolean;
  maxValue: number;
  valueRange: number;
  padding: number;
  chartHeight: number;
}): { value: number; y: number }[] {
  const { yLabelCount, showYLabels, maxValue, valueRange, padding, chartHeight } = opts;
  const labels: { value: number; y: number }[] = [];

  if (!showYLabels)
    return labels;

  for (let i = 0; i < yLabelCount; i++) {
    const ratio = i / (yLabelCount - 1);
    const value = maxValue - ratio * valueRange;
    const y = padding + ratio * chartHeight;
    labels.push({ value, y });
  }

  return labels;
}

function ChartYAxisLabels({
  labels,
  leftPadding,
  color,
}: {
  labels: { value: number; y: number }[];
  leftPadding: number;
  color: string;
}) {
  return (
    <G>
      {labels.map(label => (
        <SvgText
          key={`y-label-${label.value}`}
          x={leftPadding - 10}
          y={label.y + 4}
          textAnchor="end"
          fontSize={10}
          fill={color}
        >
          {formatNumber(label.value)}
        </SvgText>
      ))}
    </G>
  );
}

function ChartGrid({
  labels,
  points,
  layout,
  color,
}: {
  labels: { value: number; y: number }[];
  points: ChartPoint[];
  layout: ChartLayout;
  color: string;
}) {
  return (
    <G>
      {labels.map(label => (
        <Line
          key={`grid-h-${label.value}`}
          x1={layout.leftPadding}
          y1={label.y}
          x2={layout.chartWidth - layout.padding}
          y2={label.y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}

      {points.map((point, _index) => (
        <Line
          key={`grid-v-${point.x}`}
          x1={point.x}
          y1={layout.padding}
          x2={point.x}
          y2={layout.height - layout.padding}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.2}
        />
      ))}
    </G>
  );
}

function ChartXAxisLabels({
  data,
  points,
  layout,
  color,
}: {
  data: ChartDataPoint[];
  points: ChartPoint[];
  layout: ChartLayout;
  color: string;
}) {
  return (
    <G>
      {data.map((point, index) => (
        <SvgText
          key={`x-label-${point.x}`}
          x={points[index].x}
          y={layout.height - 5}
          textAnchor="middle"
          fontSize={10}
          fill={color}
        >
          {point.label ?? point.x.toString()}
        </SvgText>
      ))}
    </G>
  );
}

function ChartTooltip({
  point,
  value,
  layout,
  color,
}: {
  point: ChartPoint;
  value: number;
  layout: ChartLayout;
  color: string;
}) {
  return (
    <G>
      <Line
        x1={point.x}
        y1={layout.padding}
        x2={point.x}
        y2={layout.height - layout.padding}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />
      <Circle
        cx={point.x}
        cy={point.y}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      <SvgText
        x={point.x}
        y={Math.max(12, point.y - 12)}
        textAnchor="middle"
        fontSize={11}
        fontWeight="700"
        fill={color}
      >
        {formatNumber(value)}
      </SvgText>
    </G>
  );
}

function ChartSvg({
  data,
  points,
  labels,
  layout,
  palette,
  gradient,
  showGrid,
  showLabels,
  showYLabels,
  interactive,
  activePointIndex,
  areaAnimatedProps,
  lineAnimatedProps,
  animationProgress,
}: {
  data: ChartDataPoint[];
  points: ChartPoint[];
  labels: { value: number; y: number }[];
  layout: ChartLayout;
  palette: ChartPalette;
  gradient: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showYLabels: boolean;
  interactive: boolean;
  activePointIndex: number | null;
  areaAnimatedProps: PathAnimatedProps;
  lineAnimatedProps: PathAnimatedProps;
  animationProgress: SharedValue<number>;
}) {
  return (
    <Svg width={layout.chartWidth} height={layout.height}>
      <Defs>
        {gradient && (
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={palette.primary} stopOpacity="0.05" />
          </LinearGradient>
        )}
      </Defs>

      {showYLabels && (
        <ChartYAxisLabels labels={labels} leftPadding={layout.leftPadding} color={palette.muted} />
      )}

      {showGrid && <ChartGrid labels={labels} points={points} layout={layout} color={palette.muted} />}

      {gradient && (
        <AnimatedPath
          d={createAreaPath(points, layout.height - layout.padding)}
          fill="url(#gradient)"
          animatedProps={areaAnimatedProps}
        />
      )}

      <AnimatedPath
        d={createPath(points)}
        stroke={palette.primary}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={lineAnimatedProps}
      />

      {points.map((point, index) => (
        <AnimatedPoint
          key={`point-${point.x}-${point.y}`}
          x={point.x}
          y={point.y}
          color={palette.primary}
          index={index}
          animationProgress={animationProgress}
        />
      ))}

      {showLabels && <ChartXAxisLabels data={data} points={points} layout={layout} color={palette.muted} />}

      {interactive && activePointIndex !== null && (
        <ChartTooltip
          point={points[activePointIndex]}
          value={data[activePointIndex].y}
          layout={layout}
          color={palette.muted}
        />
      )}
    </Svg>
  );
}

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

function buildChartPanGesture(opts: {
  interactive: boolean;
  onPress: (x: number) => void;
  onPressEnd: () => void;
}) {
  const { interactive, onPress, onPressEnd } = opts;

  return Gesture.Pan()
    .enabled(interactive)
    .onStart((event) => {
      scheduleOnRN(onPress, event.x);
    })
    .onUpdate((event) => {
      scheduleOnRN(onPress, event.x);
    })
    .onEnd(() => {
      scheduleOnRN(onPressEnd);
    });
}

export function LineChart({ data, config = {}, style }: Props) {
  const [containerWidth, setContainerWidth] = useState(300);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 1000,
    gradient = false,
    interactive = false,
    showYLabels = true,
    yLabelCount = 5,
    yAxisWidth = 20,
  } = config;

  const chartWidth = containerWidth || config.width || 300;

  const palette: ChartPalette = {
    primary: usePrimaryHex(),
    muted: useThemeColors().muted,
  };

  const animationProgress = useSharedValue(0);
  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated ? `${animationProgress.value * 1000} 1000` : undefined,
  }));
  const areaAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated ? `${animationProgress.value * 1000} 1000` : undefined,
  }));

  useEffect(() => {
    if (animated) {
      animationProgress.set(withTiming(1, { duration }));
    }
    else {
      animationProgress.set(1);
    }
  }, [data, animated, duration, animationProgress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  if (!data.length)
    return null;

  const maxValue = Math.max(...data.map(d => d.y));
  const minValue = Math.min(...data.map(d => d.y));
  const valueRange = maxValue - minValue || 1;

  const leftPadding = showYLabels ? padding + yAxisWidth : padding;
  const chartHeight = height - padding * 2;
  const layout: ChartLayout = { chartWidth, height, padding, leftPadding, chartHeight };

  const points: ChartPoint[] = data.map((point, index) => ({
    x: leftPadding + (data.length > 1 ? index / (data.length - 1) : 0.5) * (chartWidth - leftPadding - padding),
    y: padding + ((maxValue - point.y) / valueRange) * chartHeight,
  }));

  const labels = buildYAxisLabels({ yLabelCount, showYLabels, maxValue, valueRange, padding, chartHeight });

  const panGesture = buildChartPanGesture({
    interactive,
    onPress: x => setActivePointIndex(findNearestPointIndex(points, x)),
    onPressEnd: () => setActivePointIndex(null),
  });

  return (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Line chart with ${data.length} data points, ranging from ${formatNumber(minValue)} to ${formatNumber(maxValue)}`}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <ChartSvg
            data={data}
            points={points}
            labels={labels}
            layout={layout}
            palette={palette}
            gradient={gradient}
            showGrid={showGrid}
            showLabels={showLabels}
            showYLabels={showYLabels}
            interactive={interactive}
            activePointIndex={activePointIndex}
            areaAnimatedProps={areaAnimatedProps}
            lineAnimatedProps={lineAnimatedProps}
            animationProgress={animationProgress}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
