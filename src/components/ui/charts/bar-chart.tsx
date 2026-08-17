import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ChartLoader } from './chart-loader';

export type BarChartDataPoint = {
  label?: string;
  value: number;
  color?: string;
};

type BarChartConfig = {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  showYLabels?: boolean;
  yLabelCount?: number;
};

type BarLayout = {
  chartWidth: number;
  height: number;
  padding: number;
  leftPadding: number;
  chartHeight: number;
  innerWidth: number;
};

type BarGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

function buildYAxisLabels(opts: {
  yLabelCount: number;
  showYLabels: boolean;
  maxValue: number;
  padding: number;
  chartHeight: number;
}): { value: number; y: number }[] {
  const { yLabelCount, showYLabels, maxValue, padding, chartHeight } = opts;
  const labels: { value: number; y: number }[] = [];

  if (!showYLabels)
    return labels;

  for (let i = 0; i < yLabelCount; i++) {
    const ratio = i / (yLabelCount - 1);
    const y = padding + ratio * chartHeight;
    labels.push({ value: maxValue - ratio * maxValue, y });
  }

  return labels;
}

function AnimatedBar({
  bar,
  progress,
}: {
  bar: BarGeometry;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    y: bar.y + bar.height * (1 - progress.value),
    height: bar.height * progress.value,
  }));

  return (
    <AnimatedRect
      x={bar.x}
      y={bar.y}
      width={bar.width}
      height={bar.height}
      rx={4}
      fill={bar.color}
      animatedProps={animatedProps}
    />
  );
}

function BarYAxisLabels({
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
          key={`bar-y-label-${label.value}`}
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

function BarGrid({
  labels,
  layout,
  color,
}: {
  labels: { value: number; y: number }[];
  layout: BarLayout;
  color: string;
}) {
  return (
    <G>
      {labels.map(label => (
        <Line
          key={`bar-grid-h-${label.value}`}
          x1={layout.leftPadding}
          y1={label.y}
          x2={layout.chartWidth - layout.padding}
          y2={label.y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
    </G>
  );
}

function BarXAxisLabels({
  bars,
  data,
  layout,
  color,
}: {
  bars: BarGeometry[];
  data: BarChartDataPoint[];
  layout: BarLayout;
  color: string;
}) {
  return (
    <G>
      {bars.map((bar, index) => (
        <SvgText
          key={`bar-x-label-${data[index].label ?? data[index].value}`}
          x={bar.x + bar.width / 2}
          y={layout.height - 5}
          textAnchor="middle"
          fontSize={10}
          fill={color}
        >
          {data[index].label ?? ''}
        </SvgText>
      ))}
    </G>
  );
}

function BarChartSvg({
  bars,
  data,
  labels,
  layout,
  muted,
  showGrid,
  showLabels,
  showYLabels,
  progress,
}: {
  bars: BarGeometry[];
  data: BarChartDataPoint[];
  labels: { value: number; y: number }[];
  layout: BarLayout;
  muted: string;
  showGrid: boolean;
  showLabels: boolean;
  showYLabels: boolean;
  progress: SharedValue<number>;
}) {
  return (
    <Svg width={layout.chartWidth} height={layout.height}>
      {showYLabels && (
        <BarYAxisLabels labels={labels} leftPadding={layout.leftPadding} color={muted} />
      )}

      {showGrid && <BarGrid labels={labels} layout={layout} color={muted} />}

      {bars.map(bar => (
        <AnimatedBar key={`bar-${bar.width}-${bar.height}-${bar.x}`} bar={bar} progress={progress} />
      ))}

      {showLabels && (
        <BarXAxisLabels bars={bars} data={data} layout={layout} color={muted} />
      )}
    </Svg>
  );
}

type BarChartProps = {
  data: BarChartDataPoint[];
  config?: BarChartConfig;
  style?: ViewStyle;
  loaderDelay?: number;
};

export function BarChart({ data, config = {}, style, loaderDelay = 120 }: BarChartProps) {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 800,
    showYLabels = true,
    yLabelCount = 5,
  } = config;

  const chartWidth = containerWidth || config.width || 300;
  const primary = usePrimaryHex();
  const muted = useThemeColors().muted;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(animated ? withTiming(1, { duration }) : 1);
  }, [animated, duration, progress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  if (!data.length)
    return null;

  const maxValue = Math.max(...data.map(item => item.value), 1);
  const leftPadding = showYLabels ? padding + 20 : padding;
  const chartHeight = height - padding * 2;
  const innerWidth = chartWidth - leftPadding - padding;
  const barGap = innerWidth / data.length;
  const barWidth = Math.min(36, barGap * 0.6);

  const layout: BarLayout = { chartWidth, height, padding, leftPadding, chartHeight, innerWidth };

  const bars: BarGeometry[] = data.map((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    return {
      x: leftPadding + index * barGap + (barGap - barWidth) / 2,
      y: padding + (chartHeight - barHeight),
      width: barWidth,
      height: barHeight,
      color: item.color ?? primary,
    };
  });

  const labels = buildYAxisLabels({ yLabelCount, showYLabels, maxValue, padding, chartHeight });

  const chartElement = (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Bar chart with ${data.length} bars, ranging from 0 to ${formatNumber(maxValue)}`}
    >
      <BarChartSvg
        bars={bars}
        data={data}
        labels={labels}
        layout={layout}
        muted={muted}
        showGrid={showGrid}
        showLabels={showLabels}
        showYLabels={showYLabels}
        progress={progress}
      />
    </View>
  );

  return (
    <ChartLoader delay={loaderDelay} minHeight={height}>
      {chartElement}
    </ChartLoader>
  );
}
