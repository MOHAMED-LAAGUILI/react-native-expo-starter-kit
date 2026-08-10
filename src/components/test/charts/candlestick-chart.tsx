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
import { useThemeColors } from '@/hooks/use-theme-color';

// Animated SVG Components
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);

type AnimatedCandleProps = {
  x: number;
  candleWidth: number;
  highY: number;
  lowY: number;
  bodyTop: number;
  bodyHeight: number;
  color: string;
  animationProgress: SharedValue<number>;
};

// Per-item hooks must live in their own mounted subcomponent, not in the
// parent's .map() body — calling useAnimatedProps per loop iteration
// violates Rules of Hooks the moment data.length changes. Two hooks here
// (wick + body), both owned by this one subcomponent instance.
function AnimatedCandle({ x, candleWidth, highY, lowY, bodyTop, bodyHeight, color, animationProgress }: AnimatedCandleProps) {
  const wickAnimatedProps = useAnimatedProps(() => ({
    y1: highY,
    y2: lowY,
    opacity: animationProgress.value,
  }));

  const bodyAnimatedProps = useAnimatedProps(() => ({
    height: animationProgress.value * bodyHeight,
    y: bodyTop,
    opacity: animationProgress.value,
  }));

  return (
    <>
      <AnimatedLine
        x1={x + candleWidth / 2}
        x2={x + candleWidth / 2}
        stroke={color}
        strokeWidth={1}
        animatedProps={wickAnimatedProps}
      />
      <AnimatedRect
        x={x}
        width={candleWidth}
        fill={color}
        stroke={color}
        strokeWidth={1}
        animatedProps={bodyAnimatedProps}
      />
    </>
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

type CandlestickDataPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type CandlestickLayout = {
  chartWidth: number;
  chartHeight: number;
  height: number;
  padding: number;
  candleWidth: number;
  candleSpacing: number;
  minValue: number;
  maxValue: number;
  valueRange: number;
};

type CandlestickPalette = {
  bullish: string;
  bearish: string;
  muted: string;
};

function CandlestickChartSvg({
  data,
  layout,
  palette,
  showGrid,
  showLabels,
  animationProgress,
}: {
  data: CandlestickDataPoint[];
  layout: CandlestickLayout;
  palette: CandlestickPalette;
  showGrid: boolean;
  showLabels: boolean;
  animationProgress: SharedValue<number>;
}) {
  const {
    chartWidth,
    chartHeight,
    height,
    padding,
    candleWidth,
    candleSpacing,
    maxValue,
    valueRange,
  } = layout;

  return (
    <Svg width={chartWidth} height={height}>
      {/* Grid lines */}
      {showGrid && (
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <Line
              key={`grid-line-${ratio}`}
              x1={padding}
              y1={padding + ratio * chartHeight}
              x2={chartWidth - padding}
              y2={padding + ratio * chartHeight}
              stroke={palette.muted}
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
        </G>
      )}

      {data.map((item, index) => {
        const isBullish = item.close >= item.open;
        const color = isBullish ? palette.bullish : palette.bearish;

        const x = padding + index * (candleWidth + candleSpacing) + candleSpacing / 2;
        const highY = padding + ((maxValue - item.high) / valueRange) * chartHeight;
        const lowY = padding + ((maxValue - item.low) / valueRange) * chartHeight;
        const openY = padding + ((maxValue - item.open) / valueRange) * chartHeight;
        const closeY = padding + ((maxValue - item.close) / valueRange) * chartHeight;

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;

        return (
          <G key={`candle-${item.date}`}>
            <AnimatedCandle
              x={x}
              candleWidth={candleWidth}
              highY={highY}
              lowY={lowY}
              bodyTop={bodyTop}
              bodyHeight={bodyHeight}
              color={color}
              animationProgress={animationProgress}
            />

            {showLabels
              && index % Math.max(1, Math.floor(data.length / 5)) === 0 && (
              <SvgText
                x={x + candleWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize={10}
                fill={palette.muted}
              >
                {item.date}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

type Props = {
  data: CandlestickDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

export function CandlestickChart({ data, config = {}, style }: Props) {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 800,
  } = config;

  // Use measured width or fallback to config width or default
  const chartWidth = containerWidth || config.width || 300;

  const palette: CandlestickPalette = {
    bullish: getPaletteColor('green'),
    bearish: getPaletteColor('red'),
    muted: useThemeColors().muted,
  };

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

  const allValues = data.flatMap(item => [item.open, item.high, item.low, item.close]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const valueRange = maxValue - minValue || 1;

  const chartHeight = height - padding * 2;
  const innerChartWidth = chartWidth - padding * 2;
  const candleWidth = (innerChartWidth / data.length) * 0.6;
  const candleSpacing = (innerChartWidth / data.length) * 0.4;

  const layout: CandlestickLayout = {
    chartWidth,
    chartHeight,
    height,
    padding,
    candleWidth,
    candleSpacing,
    minValue,
    maxValue,
    valueRange,
  };

  return (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Candlestick chart with ${data.length} candles, ranging from ${Math.round(minValue)} to ${Math.round(maxValue)}`}
    >
      <CandlestickChartSvg
        data={data}
        layout={layout}
        palette={palette}
        showGrid={showGrid}
        showLabels={showLabels}
        animationProgress={animationProgress}
      />
    </View>
  );
}
