import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

// Animated SVG Components
const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedAreaProps = {
  d: string;
  fill: string;
  stroke: string;
  opacityFactor: number;
  animationProgress: SharedValue<number>;
};

// Per-item hook must live in its own mounted subcomponent, not in the
// parent's Array.from(...) render loop — calling useAnimatedProps per loop
// iteration violates Rules of Hooks the moment seriesCount changes.
function AnimatedArea({
  d,
  fill,
  stroke,
  opacityFactor,
  animationProgress,
}: AnimatedAreaProps) {
  const areaAnimatedProps = useAnimatedProps(() => ({
    opacity: animationProgress.value * opacityFactor,
  }));

  return (
    <AnimatedPath
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      animatedProps={areaAnimatedProps}
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

export type StackedAreaDataPoint = {
  x: number;
  y: number[];
  label?: string;
};

type Props = {
  data: StackedAreaDataPoint[];
  colors?: string[];
  config?: ChartConfig;
  style?: ViewStyle;
  categories?: string[];
};

type StackedSeries = StackedAreaDataPoint & { cumulative: number[] };

type AreaPathProps = {
  stackedData: StackedSeries[];
  data: StackedAreaDataPoint[];
  padding: number;
  innerChartWidth: number;
  maxValue: number;
  chartHeight: number;
  height: number;
  seriesColors: string[];
  animationProgress: SharedValue<number>;
};

// Utility function to create smooth path
function createSmoothPath(points: { x: number; y: number }[]): string {
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

function createAreaPath(topPoints: { x: number; y: number }[], bottomPoints: { x: number; y: number }[]): string {
  if (topPoints.length === 0 || bottomPoints.length === 0)
    return '';

  // Create the top curve
  const topPath = createSmoothPath(topPoints);

  // Create the bottom curve (reversed order for proper path closure)
  const reversedBottomPoints = [...bottomPoints].reverse();

  // Start the area path with the top curve
  let areaPath = topPath;

  // Add line to the last bottom point
  areaPath += ` L${reversedBottomPoints[0].x},${reversedBottomPoints[0].y}`;

  // Add the bottom curve
  if (reversedBottomPoints.length > 1) {
    for (let i = 1; i < reversedBottomPoints.length; i++) {
      const prevPoint = reversedBottomPoints[i - 1];
      const currentPoint = reversedBottomPoints[i];
      const cpx = (prevPoint.x + currentPoint.x) / 2;
      const cpy = prevPoint.y;
      areaPath += ` Q${cpx},${cpy} ${currentPoint.x},${currentPoint.y}`;
    }
  }

  // Close the path
  areaPath += ' Z';

  return areaPath;
}

function StackedAreaPaths({
  stackedData,
  data,
  padding,
  innerChartWidth,
  maxValue,
  chartHeight,
  height,
  seriesColors,
  animationProgress,
}: AreaPathProps) {
  return (
    <G>
      {Array.from({ length: seriesColors.length }, (_, seriesIndex) => {
        const topPoints = stackedData.map((point, pointIndex) => ({
          x: padding + (pointIndex / (data.length - 1)) * innerChartWidth,
          y:
            padding
            + ((maxValue - point.cumulative[seriesIndex]) / maxValue)
            * chartHeight,
        }));

        // All areas extend from x-axis (y=0) to their cumulative value
        const bottomPoints = stackedData.map((point, pointIndex) => ({
          x: padding + (pointIndex / (data.length - 1)) * innerChartWidth,
          y: height - padding, // Always extend to x-axis (y=0 in data terms)
        }));

        const areaPath = createAreaPath(topPoints, bottomPoints);

        return (
          <AnimatedArea
            key={`area-${seriesIndex}`}
            d={areaPath}
            fill={`url(#areaGradient-${seriesIndex})`}
            stroke={seriesColors[seriesIndex]}
            opacityFactor={seriesIndex === 0 ? 1 : 0.7} // Make upper areas slightly transparent
            animationProgress={animationProgress}
          />
        );
      })}
    </G>
  );
}

type ChartGridProps = {
  padding: number;
  chartHeight: number;
  chartWidth: number;
  mutedColor: string;
};

function ChartGrid({
  padding,
  chartHeight,
  chartWidth,
  mutedColor,
}: ChartGridProps) {
  return (
    <G>
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <Line
          key={`grid-line-${ratio}`}
          x1={padding}
          y1={padding + ratio * chartHeight}
          x2={chartWidth - padding}
          y2={padding + ratio * chartHeight}
          stroke={mutedColor}
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
    </G>
  );
}

type ChartLabelsProps = {
  data: StackedAreaDataPoint[];
  padding: number;
  innerChartWidth: number;
  height: number;
  mutedColor: string;
};

function ChartLabels({
  data,
  padding,
  innerChartWidth,
  height,
  mutedColor,
}: ChartLabelsProps) {
  return (
    <G>
      {data.map((point, index) => (
        <SvgText
          key={`x-label-${point.label ?? point.x}`}
          x={padding + (index / (data.length - 1)) * innerChartWidth}
          y={height - 5}
          textAnchor="middle"
          fontSize={12}
          fill={mutedColor}
        >
          {point.label || point.x.toString()}
        </SvgText>
      ))}
    </G>
  );
}

type ChartLegendProps = {
  categories: string[];
  padding: number;
  seriesColors: string[];
  mutedColor: string;
};

function ChartLegend({
  categories,
  padding,
  seriesColors,
  mutedColor,
}: ChartLegendProps) {
  return (
    <G>
      {categories.map((category, index) => (
        <G key={`legend-entry-${category}`}>
          <Path
            d={`M${padding + index * 80},${padding - 15} L${
              padding + index * 80 + 15
            },${padding - 15}`}
            stroke={seriesColors[index]}
            strokeWidth={3}
          />
          <SvgText
            x={padding + index * 80 + 20}
            y={padding - 10}
            fontSize={11}
            fill={mutedColor}
          >
            {category}
          </SvgText>
        </G>
      ))}
    </G>
  );
}

type ChartBodyProps = {
  chartWidth: number;
  height: number;
  padding: number;
  showGrid: boolean;
  showLabels: boolean;
  mutedColor: string;
  seriesColors: string[];
  stackedData: StackedSeries[];
  data: StackedAreaDataPoint[];
  innerChartWidth: number;
  chartHeight: number;
  maxValue: number;
  categories: string[];
  animationProgress: SharedValue<number>;
};

function ChartBody({
  chartWidth,
  height,
  padding,
  showGrid,
  showLabels,
  mutedColor,
  seriesColors,
  stackedData,
  data,
  innerChartWidth,
  chartHeight,
  maxValue,
  categories,
  animationProgress,
}: ChartBodyProps) {
  return (
    <Svg width={chartWidth} height={height}>
      <Defs>
        {seriesColors.map((color, index) => (
          <LinearGradient
            key={`gradient-def-${color}`}
            id={`areaGradient-${index}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </LinearGradient>
        ))}
      </Defs>

      {/* Grid lines */}
      {showGrid && (
        <ChartGrid
          padding={padding}
          chartHeight={chartHeight}
          chartWidth={chartWidth}
          mutedColor={mutedColor}
        />
      )}

      {/* Stacked areas */}
      <StackedAreaPaths
        stackedData={stackedData}
        data={data}
        padding={padding}
        innerChartWidth={innerChartWidth}
        maxValue={maxValue}
        chartHeight={chartHeight}
        height={height}
        seriesColors={seriesColors}
        animationProgress={animationProgress}
      />

      {/* Labels */}
      {showLabels && (
        <ChartLabels
          data={data}
          padding={padding}
          innerChartWidth={innerChartWidth}
          height={height}
          mutedColor={mutedColor}
        />
      )}

      {/* Legend */}
      {categories.length > 0 && (
        <ChartLegend
          categories={categories}
          padding={padding}
          seriesColors={seriesColors}
          mutedColor={mutedColor}
        />
      )}
    </Svg>
  );
}

export function StackedAreaChart({
  data,
  colors = [],
  config = {},
  style,
  categories = [],
}: Props) {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 1000,
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

  // Calculate stacked totals and max value
  const stackedData: StackedSeries[] = data.map((point) => {
    const cumulative = point.y.reduce((acc, val) => {
      acc.push((acc[acc.length - 1] || 0) + val);
      return acc;
    }, [] as number[]);
    return { ...point, cumulative };
  });

  const maxValue = Math.max(
    ...stackedData.map(d => Math.max(...d.cumulative)),
  );
  const seriesCount = data[0]?.y.length || 0;

  const innerChartWidth = chartWidth - padding * 2;
  const chartHeight = height - padding * 2;

  // Default colors if not provided
  const defaultColors = [
    primaryColor,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#0088fe',
  ];

  // Cycle the default palette via modulo past its length instead of
  // leaving `undefined` colors for series beyond it.
  const seriesColors = Array.from({ length: seriesCount }, (_, i) =>
    i < colors.length
      ? colors[i]
      : defaultColors[(i - colors.length) % defaultColors.length]);

  return (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Stacked area chart with ${data.length} data points across ${seriesCount} series, maximum value ${Math.round(maxValue)}`}
    >
      <ChartBody
        chartWidth={chartWidth}
        height={height}
        padding={padding}
        showGrid={showGrid}
        showLabels={showLabels}
        mutedColor={mutedColor}
        seriesColors={seriesColors}
        stackedData={stackedData}
        data={data}
        innerChartWidth={innerChartWidth}
        chartHeight={chartHeight}
        maxValue={maxValue}
        categories={categories}
        animationProgress={animationProgress}
      />
    </View>
  );
}
