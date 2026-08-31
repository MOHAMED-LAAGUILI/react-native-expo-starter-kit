import type { LayoutChangeEvent } from 'react-native';
import type { ChartDataItem } from './chart';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useThemeColors } from '@/hooks/use-theme-color';
import { chartItemKey, getAxisColor, niceAxisMax } from '@/utils/chart';
import { cn } from '@/utils/cn';

type ChartBarsHorizontalProps = {
  data: ChartDataItem[];
  /** Measured container width — the chart fills it exactly. */
  width: number;
  height?: number;
  maxValue?: number;
  /** Drops the category labels on the left; the caller usually shows a legend instead. */
  hideLabels?: boolean;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const PAD_TOP = 8;
const PAD_RIGHT = 8;
/** Strip under the plot holding the value-axis ticks. */
const AXIS_LABELS_HEIGHT = 26;
const CATEGORY_LABEL_WIDTH = 88;
const ROW_GAP = 12;
const MAX_BAR_THICKNESS = 36;
const MIN_BAR_THICKNESS = 6;
const BAR_RADIUS = 6;
const SECTIONS = 4;
const TICK_FONT_SIZE = 10;

/**
 * Horizontal bars drawn straight to SVG. gifted-charts renders its `horizontal`
 * mode by rotating the chart with a transform, which leaves the layout box at the
 * pre-rotation size — the card then reserves far more height than the chart uses.
 * Drawing the bars directly makes the chart exactly as tall as `height`.
 */
function ChartBarsHorizontal({
  data,
  width,
  height = 200,
  maxValue,
  hideLabels,
  className,
  onLayout,
}: ChartBarsHorizontalProps) {
  const { isDark, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);

  const max = maxValue ?? niceAxisMax(Math.max(...data.map(item => item.value), 1));
  const labelWidth = hideLabels ? 0 : CATEGORY_LABEL_WIDTH;
  const plotWidth = Math.max(width - labelWidth - PAD_RIGHT, 0);
  const plotHeight = Math.max(height - PAD_TOP - AXIS_LABELS_HEIGHT, 0);

  // Rows share the available height evenly, so the bars always fill the box the
  // card reserved for them however many series are passed in.
  const rowSlot = plotHeight / Math.max(data.length, 1);
  const thickness = Math.max(Math.min(rowSlot - ROW_GAP, MAX_BAR_THICKNESS), MIN_BAR_THICKNESS);
  const baseline = PAD_TOP + plotHeight;
  const ticks = Array.from({ length: SECTIONS + 1 }, (_, index) => index / SECTIONS);

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={onLayout}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {ticks.map(tick => (
            <Line
              key={`rule-${tick}`}
              x1={labelWidth + plotWidth * tick}
              y1={PAD_TOP}
              x2={labelWidth + plotWidth * tick}
              y2={baseline}
              stroke={axisColor}
              strokeWidth={1}
            />
          ))}
          {data.map((item, index) => {
            const top = PAD_TOP + index * rowSlot + (rowSlot - thickness) / 2;
            const barLength = plotWidth * Math.min(Math.max(item.value / max, 0), 1);

            return (
              <Rect
                key={`bar-${chartItemKey(item)}`}
                x={labelWidth}
                y={top}
                width={Math.max(barLength, BAR_RADIUS)}
                height={thickness}
                rx={BAR_RADIUS}
                fill={item.color}
              />
            );
          })}
          {!hideLabels && data.map((item, index) => (
            <SvgText
              key={`label-${chartItemKey(item)}`}
              x={labelWidth - 8}
              y={PAD_TOP + index * rowSlot + rowSlot / 2 + TICK_FONT_SIZE / 3}
              fill={muted}
              fontSize={TICK_FONT_SIZE}
              textAnchor="end"
            >
              {item.label ?? ''}
            </SvgText>
          ))}
          <Line
            x1={labelWidth}
            y1={baseline}
            x2={labelWidth + plotWidth}
            y2={baseline}
            stroke={axisColor}
            strokeWidth={1}
          />
          {ticks.map(tick => (
            <SvgText
              key={`tick-${tick}`}
              x={labelWidth + plotWidth * tick}
              y={height - 6}
              fill={muted}
              fontSize={TICK_FONT_SIZE}
              textAnchor={tick === 0 ? 'start' : tick === 1 ? 'end' : 'middle'}
            >
              {`${Math.round(max * tick)}h`}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

export type { ChartBarsHorizontalProps };
export { ChartBarsHorizontal };
