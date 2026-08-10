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
import { getPaletteColor } from '@/config/color-palettes';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

// Animated SVG Components
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type AnimatedHorizontalSegmentProps = {
  x: number;
  y: number;
  barHeight: number;
  segmentWidth: number;
  fill: string;
  animationProgress: SharedValue<number>;
};

// Per-item hooks must live in their own mounted subcomponent, not in the
// parent's nested item×value .map() body — calling useAnimatedProps per
// loop iteration violates Rules of Hooks the moment data changes. Two
// subcomponents here (horizontal vs vertical branch) since the two modes
// animate different SVG attributes.
function AnimatedHorizontalSegment({
  x,
  y,
  barHeight,
  segmentWidth,
  fill,
  animationProgress,
}: AnimatedHorizontalSegmentProps) {
  const segmentAnimatedProps = useAnimatedProps(() => ({
    width: animationProgress.value * segmentWidth,
  }));

  return (
    <AnimatedRect
      x={x}
      y={y}
      height={barHeight}
      fill={fill}
      rx={2}
      animatedProps={segmentAnimatedProps}
    />
  );
}

type AnimatedVerticalSegmentProps = {
  x: number;
  barWidth: number;
  segmentHeight: number;
  bottomY: number;
  fill: string;
  animationProgress: SharedValue<number>;
};

function AnimatedVerticalSegment({
  x,
  barWidth,
  segmentHeight,
  bottomY,
  fill,
  animationProgress,
}: AnimatedVerticalSegmentProps) {
  const segmentAnimatedProps = useAnimatedProps(() => ({
    height: animationProgress.value * segmentHeight,
    y: bottomY - animationProgress.value * segmentHeight,
  }));

  return (
    <AnimatedRect
      x={x}
      width={barWidth}
      fill={fill}
      rx={2}
      animatedProps={segmentAnimatedProps}
    />
  );
}

type ChartConfig = {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
};

export type StackedBarDataPoint = {
  label: string;
  values: number[];
};

type StackedBarChartBarsProps = {
  data: StackedBarDataPoint[];
  padding: number;
  innerChartWidth: number;
  chartHeight: number;
  height: number;
  maxValue: number;
  seriesColors: string[];
  mutedColor: string;
  showGrid: boolean;
  showLabels: boolean;
  categories: string[];
  animationProgress: SharedValue<number>;
};

function HorizontalStackedBars({
  data,
  padding,
  innerChartWidth,
  chartHeight,
  height,
  maxValue,
  seriesColors,
  mutedColor,
  showGrid,
  showLabels,
  categories,
  animationProgress,
}: StackedBarChartBarsProps) {
  const barHeight = (chartHeight / data.length) * 0.8;
  const barSpacing = (chartHeight / data.length) * 0.2;

  return (
    <Svg width={innerChartWidth + padding * 2} height={height}>
      {/* Grid lines */}
      {showGrid && (
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <Line
              key={`grid-line-${ratio}`}
              x1={padding + ratio * innerChartWidth}
              y1={padding}
              x2={padding + ratio * innerChartWidth}
              y2={height - padding}
              stroke={mutedColor}
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
        </G>
      )}

      {data.map((item, itemIndex) => {
        let cumulativeWidth = 0;
        const y
          = padding + itemIndex * (barHeight + barSpacing) + barSpacing / 2;

        return (
          <G key={`bar-group-${item.label}`}>
            {item.values.map((value, valueIndex) => {
              const segmentWidth = (value / maxValue) * innerChartWidth;
              const x = padding + cumulativeWidth;

              cumulativeWidth += segmentWidth;

              return (
                <AnimatedHorizontalSegment
                  key={`h-segment-${item.label}-${seriesColors[valueIndex]}`}
                  x={x}
                  y={y}
                  barHeight={barHeight}
                  segmentWidth={segmentWidth}
                  fill={seriesColors[valueIndex]}
                  animationProgress={animationProgress}
                />
              );
            })}

            {/* Bar labels */}
            {showLabels && (
              <SvgText
                x={padding - 10}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={12}
                fill={mutedColor}
              >
                {item.label}
              </SvgText>
            )}
          </G>
        );
      })}

      {/* Legend */}
      {categories.length > 0 && (
        <G>
          {categories.map((category, index) => (
            <G key={`legend-entry-${category}`}>
              <Rect
                x={padding + index * 80}
                y={height - padding + 10}
                width={12}
                height={8}
                fill={seriesColors[index]}
                rx={2}
              />
              <SvgText
                x={padding + index * 80 + 18}
                y={height - padding + 18}
                fontSize={11}
                fill={mutedColor}
              >
                {category}
              </SvgText>
            </G>
          ))}
        </G>
      )}
    </Svg>
  );
}

function VerticalStackedBars({
  data,
  padding,
  innerChartWidth,
  chartHeight,
  height,
  maxValue,
  seriesColors,
  mutedColor,
  showGrid,
  showLabels,
  categories,
  animationProgress,
}: StackedBarChartBarsProps) {
  const barWidth = (innerChartWidth / data.length) * 0.8;
  const barSpacing = (innerChartWidth / data.length) * 0.2;

  return (
    <Svg width={innerChartWidth + padding * 2} height={height}>
      {/* Grid lines */}
      {showGrid && (
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <Line
              key={`grid-line-${ratio}`}
              x1={padding}
              y1={padding + ratio * chartHeight}
              x2={innerChartWidth + padding}
              y2={padding + ratio * chartHeight}
              stroke={mutedColor}
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
        </G>
      )}

      {data.map((item, itemIndex) => {
        let cumulativeHeight = 0;
        const x
          = padding + itemIndex * (barWidth + barSpacing) + barSpacing / 2;

        return (
          <G key={`bar-group-${item.label}`}>
            {item.values.map((value, valueIndex) => {
              const segmentHeight = (value / maxValue) * chartHeight;
              const bottomY = height - padding - cumulativeHeight;

              cumulativeHeight += segmentHeight;

              return (
                <AnimatedVerticalSegment
                  key={`v-segment-${item.label}-${seriesColors[valueIndex]}`}
                  x={x}
                  barWidth={barWidth}
                  segmentHeight={segmentHeight}
                  bottomY={bottomY}
                  fill={seriesColors[valueIndex]}
                  animationProgress={animationProgress}
                />
              );
            })}

            {/* Bar labels */}
            {showLabels && (
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize={12}
                fill={mutedColor}
              >
                {item.label}
              </SvgText>
            )}
          </G>
        );
      })}

      {/* Legend */}
      {categories.length > 0 && (
        <G>
          {categories.map((category, index) => (
            <G key={`legend-entry-${category}`}>
              <Rect
                x={padding + index * 80}
                y={padding - 25}
                width={12}
                height={8}
                fill={seriesColors[index]}
                rx={2}
              />
              <SvgText
                x={padding + index * 80 + 18}
                y={padding - 17}
                fontSize={11}
                fill={mutedColor}
              >
                {category}
              </SvgText>
            </G>
          ))}
        </G>
      )}
    </Svg>
  );
}

type StackedBarChartProps = {
  data: StackedBarDataPoint[];
  colors?: string[];
  config?: ChartConfig;
  style?: ViewStyle;
  categories?: string[];
  horizontal?: boolean;
};

export function StackedBarChart({
  data,
  colors = [],
  config = {},
  style,
  categories = [],
  horizontal = false,
}: StackedBarChartProps) {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showLabels = true,
    showGrid = true,
    animated = true,
    duration = 800,
  } = config;

  const chartWidth = containerWidth || config.width || 300;

  const primaryColor = usePrimaryHex();
  const mutedColor = useThemeColors().muted;

  const animationProgress = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, { duration });
    }
    else {
      animationProgress.value = 1;
    }
  }, [data, animated, duration, animationProgress]);

  if (!data.length)
    return null;

  const maxValue = Math.max(
    ...data.map(d => d.values.reduce((sum, val) => sum + val, 0)),
  );
  const seriesCount = data[0]?.values.length || 0;

  const innerChartWidth = chartWidth - padding * 2;
  const chartHeight = height - padding * 2;

  // Default colors if not provided
  const defaultColors = [
    primaryColor,
    getPaletteColor('blue'),
    getPaletteColor('green'),
    getPaletteColor('orange'),
    getPaletteColor('purple'),
    getPaletteColor('pink'),
    getPaletteColor('teal'),
  ];

  // Cycle the default palette via modulo past its length instead of
  // leaving `undefined` colors for series beyond it.
  const seriesColors = Array.from({ length: seriesCount }, (_, i) =>
    i < colors.length
      ? colors[i]
      : defaultColors[(i - colors.length) % defaultColors.length]);

  const barProps: StackedBarChartBarsProps = {
    data,
    padding,
    innerChartWidth,
    chartHeight,
    height,
    maxValue,
    seriesColors,
    mutedColor,
    showGrid,
    showLabels,
    categories,
    animationProgress,
  };

  return (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`${horizontal ? 'Horizontal' : ''} stacked bar chart with ${data.length} bars across ${seriesCount} series, maximum total ${Math.round(maxValue)}`}
    >
      {horizontal
        ? <HorizontalStackedBars {...barProps} />
        : <VerticalStackedBars {...barProps} />}
    </View>
  );
}
