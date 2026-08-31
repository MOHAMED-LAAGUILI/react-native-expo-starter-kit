import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useChartWidth } from '@/hooks/use-chart-width';
import { useThemeColors } from '@/hooks/use-theme-color';
import { getAxisColor, niceAxisMax } from '@/utils/chart';
import { cn } from '@/utils/cn';

type ChartPoint = {
  label: string;
  x: number;
  y: number;
  /** Third dimension — sizes the marker when the chart is drawn as bubbles. */
  weight?: number;
  color: string;
};

type ChartScatterProps = {
  data: ChartPoint[];
  height?: number;
  /** Scales each marker by `weight` instead of drawing uniform dots. */
  bubble?: boolean;
  xSuffix?: string;
  ySuffix?: string;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const AXIS_LEFT = 32;
const AXIS_BOTTOM = 20;
const PAD_TOP = 12;
const PAD_RIGHT = 16;
const SECTIONS = 4;
const DOT_RADIUS = 5;
const MIN_BUBBLE_RADIUS = 7;
const MAX_BUBBLE_RADIUS = 22;
const TICK_FONT_SIZE = 10;

function bubbleRadius({ weight, maxWeight }: { weight: number; maxWeight: number }) {
  if (maxWeight <= 0) {
    return MIN_BUBBLE_RADIUS;
  }

  // Area, not radius, should track the weight — hence the square root.
  const scale = Math.sqrt(Math.min(Math.max(weight, 0), maxWeight) / maxWeight);

  return MIN_BUBBLE_RADIUS + (MAX_BUBBLE_RADIUS - MIN_BUBBLE_RADIUS) * scale;
}

/**
 * Two-axis plot of independent points, drawn straight to SVG so both axes are
 * value-based (charting libraries built on categories can only space by index).
 * Pass `bubble` to let a third value drive the marker size.
 */
function ChartScatter({
  data,
  height = 220,
  bubble = false,
  xSuffix = '',
  ySuffix = 'h',
  className,
  onLayout,
}: ChartScatterProps) {
  const { isDark, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const { chartWidth, handleLayout } = useChartWidth(onLayout);

  const maxX = niceAxisMax(Math.max(...data.map(point => point.x), 1));
  const maxY = niceAxisMax(Math.max(...data.map(point => point.y), 1));
  const maxWeight = Math.max(...data.map(point => point.weight ?? 0), 1);

  const plotWidth = Math.max(chartWidth - AXIS_LEFT - PAD_RIGHT, 0);
  const plotHeight = Math.max(height - PAD_TOP - AXIS_BOTTOM, 0);
  const baseline = PAD_TOP + plotHeight;
  const ticks = Array.from({ length: SECTIONS + 1 }, (_, index) => index / SECTIONS);

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={handleLayout}
    >
      {chartWidth > 0 && (
        <Svg width={chartWidth} height={height}>
          {ticks.map(tick => (
            <Line
              key={`rule-${tick}`}
              x1={AXIS_LEFT}
              y1={baseline - plotHeight * tick}
              x2={AXIS_LEFT + plotWidth}
              y2={baseline - plotHeight * tick}
              stroke={axisColor}
              strokeWidth={1}
            />
          ))}
          {ticks.map(tick => (
            <SvgText
              key={`y-tick-${tick}`}
              x={AXIS_LEFT - 6}
              y={baseline - plotHeight * tick + TICK_FONT_SIZE / 3}
              fill={muted}
              fontSize={TICK_FONT_SIZE}
              textAnchor="end"
            >
              {`${Math.round(maxY * tick)}${ySuffix}`}
            </SvgText>
          ))}
          {ticks.map(tick => (
            <SvgText
              key={`x-tick-${tick}`}
              x={AXIS_LEFT + plotWidth * tick}
              y={height - 4}
              fill={muted}
              fontSize={TICK_FONT_SIZE}
              textAnchor="middle"
            >
              {`${Math.round(maxX * tick)}${xSuffix}`}
            </SvgText>
          ))}
          <Line
            x1={AXIS_LEFT}
            y1={PAD_TOP}
            x2={AXIS_LEFT}
            y2={baseline}
            stroke={axisColor}
            strokeWidth={1}
          />
          {data.map(point => (
            <Circle
              key={`point-${point.label}`}
              cx={AXIS_LEFT + plotWidth * (point.x / maxX)}
              cy={baseline - plotHeight * (point.y / maxY)}
              r={bubble ? bubbleRadius({ weight: point.weight ?? 0, maxWeight }) : DOT_RADIUS}
              fill={point.color}
              fillOpacity={bubble ? 0.55 : 0.9}
              stroke={point.color}
              strokeWidth={bubble ? 1.5 : 0}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}

export type { ChartPoint, ChartScatterProps };
export { ChartScatter };
