import type { LayoutChangeEvent } from 'react-native';
import type {
  barDataItem,
  candleStickDataItem,
  lineDataItem,
  pieDataItem,
  stackDataItem,
} from 'react-native-gifted-charts';
import * as React from 'react';
import { View } from 'react-native';
import {
  BarChart,
  CandleStickChart,
  LineChart,
  PieChart,
} from 'react-native-gifted-charts';

import { useChartWidth } from '@/hooks/use-chart-width';
import { useThemeColors } from '@/hooks/use-theme-color';
import { getAxisColor } from '@/utils/chart';
import { cn } from '@/utils/cn';
import { isWeb } from '@/utils/platform';
import { ChartBarsHorizontal } from './chart-bars-horizontal';
import { Text } from './text';

type ChartBarsVariant = 'bar-vertical' | 'bar-horizontal';

type ChartDataItem = {
  value: number;
  label?: string;
  color: string;
  tooltipText?: string;
  text?: string;
};

type ChartBaseProps = {
  data: ChartDataItem[];
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

type ChartPieProps = ChartBaseProps & {
  showLegend?: boolean;
  showTooltip?: boolean;
  donut?: boolean;
  radius?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerSubtitle?: string;
  isAnimated?: boolean;
};

type ChartBarsProps = ChartBaseProps & {
  variant?: ChartBarsVariant;
  width?: number;
  height?: number;
  maxValue?: number;
  stepValue?: number;
  hideLabels?: boolean;
  isAnimated?: boolean;
};

type ChartColumnProps = ChartBaseProps & {
  height?: number;
  showValues?: boolean;
  isAnimated?: boolean;
};

type ChartLineProps = ChartBaseProps & {
  height?: number;
  hideLabels?: boolean;
  isAnimated?: boolean;
  /** Fills the space under the line — the difference between a line and an area chart. */
  area?: boolean;
  curved?: boolean;
};

type StackSegment = {
  value: number;
  color: string;
};

type StackItem = {
  label?: string;
  stacks: StackSegment[];
};

type ChartStackedProps = {
  data: StackItem[];
  height?: number;
  hideLabels?: boolean;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  isAnimated?: boolean;
};

type ChartAreaSeries = {
  label: string;
  color: string;
  values: number[];
};

type ChartStackedAreaProps = {
  /** Bottom band first — values are stacked in the order given (3 bands max). */
  series: ChartAreaSeries[];
  labels?: string[];
  height?: number;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  isAnimated?: boolean;
};

type CandleItem = {
  label?: string;
  open: number;
  close: number;
  high: number;
  low: number;
  color?: string;
};

type ChartCandlestickProps = {
  data: CandleItem[];
  height?: number;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  isAnimated?: boolean;
};

/** Kept short — gifted-charts animates on the JS thread, so long durations block interaction. */
const CHART_ANIMATION_MS = 350;
const FALLBACK_SERIES_COLOR = '#8b5cf6';
const DATA_POINT_SIZE = 8;
/** gifted-charts exposes data2…data5, but three bands is all a phone-width stack can read. */
const MAX_AREA_SERIES = 3;
/** Candle body as a share of the horizontal slot each candle gets. */
const CANDLE_WIDTH_RATIO = 0.45;
const MIN_CANDLE_WIDTH = 8;
/** Horizontal rules drawn above the x-axis on the bar/column charts. */
const AXIS_SECTIONS = 4;
const MAX_CANDLE_WIDTH = 28;
/** Left gutter gifted-charts reserves for the y-axis labels. */
const Y_AXIS_GUTTER = 44;
const CHART_EDGE_SPACING = 12;

function ChartLegend({ data }: { data: ChartDataItem[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View className="gap-2">
      {data.map((item) => {
        const percent = total === 0 ? 0 : (item.value / total) * 100;

        return (
          <View
            key={`legend-${item.label}`}
            className="flex-row items-center justify-between px-2 py-1"
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="size-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text className="flex-1 text-sm font-medium">
                {item.label}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text variant="caption" className="text-muted-foreground">
                {percent.toFixed(0)}
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                %
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ChartPie({
  data,
  showLegend,
  showTooltip,
  donut,
  radius: chartRadius,
  innerRadius,
  centerLabel,
  centerSubtitle,
  className,
  onLayout,
  isAnimated = true,
}: ChartPieProps) {
  const { background } = useThemeColors();

  const pieChartData: pieDataItem[] = data.map(item => ({
    value: item.value,
    color: item.color,
    text: item.text,
    tooltipText: item.tooltipText,
  }));

  return (
    <View className={cn('items-center', className)} onLayout={onLayout}>
      <PieChart
        data={pieChartData}
        donut={donut}
        radius={chartRadius}
        innerRadius={innerRadius}
        showTooltip={showTooltip}
        showValuesAsTooltipText={false}
        focusOnPress
        sectionAutoFocus
        innerCircleColor={background}
        strokeColor={background}
        strokeWidth={2}
        isAnimated={isAnimated}
        centerLabelComponent={() => (
          <View className="items-center">
            {centerSubtitle && (
              <Text variant="caption" className="mb-1 text-muted-foreground">
                {centerSubtitle}
              </Text>
            )}
            {centerLabel && (
              <Text variant="h2" className="font-bold">
                {centerLabel}
              </Text>
            )}
          </View>
        )}
      />
      {showLegend && <ChartLegend data={data} />}
    </View>
  );
}

function ChartBars({
  data,
  variant,
  width,
  height,
  maxValue,
  stepValue,
  className,
  onLayout,
  hideLabels,
  isAnimated = true,
}: ChartBarsProps) {
  const { isDark, background, muted } = useThemeColors();

  const axisColor = getAxisColor(isDark);
  const textColor = isDark ? '#ffffff' : '#171717';
  const computedMaxValue = maxValue ?? Math.ceil(Math.max(...data.map(d => d.value), 1) * 1.1);

  // gifted-charts draws horizontal bars by rotating the whole chart, which leaves
  // the layout box at its pre-rotation size and strands empty space in the card.
  if (variant === 'bar-horizontal') {
    return (
      <ChartBarsHorizontal
        data={data}
        width={width ?? 0}
        height={height}
        maxValue={maxValue}
        hideLabels={hideLabels}
        className={className}
        onLayout={onLayout}
      />
    );
  }

  const barChartData: barDataItem[] = data.map((item) => {
    const base: barDataItem = {
      value: item.value,
      frontColor: item.color,
      labelWidth: 0,
      barWidth: 24,
    };
    if (!hideLabels) {
      base.label = item.label ?? '';
    }
    return base;
  });

  return (
    <View className={cn('w-full overflow-hidden rounded-xl', className)} onLayout={onLayout}>
      {width != null && width > 0 && (
        <BarChart
          data={barChartData}
          width={width}
          adjustToWidth
          height={height}
          barBorderTopLeftRadius={6}
          barBorderTopRightRadius={6}
          initialSpacing={12}
          spacing={12}
          endSpacing={12}
          hideRules={false}
          rulesColor={axisColor}
          yAxisTextStyle={{
            color: muted,
            fontSize: 11,
            fontWeight: '500',
          }}
          xAxisLabelTextStyle={{
            color: muted,
            fontSize: 11,
            fontWeight: '500',
            textAlign: 'center',
          }}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          noOfSections={4}
          maxValue={computedMaxValue}
          stepValue={stepValue}
          yAxisLabelSuffix="h"
          xAxisLabelsHeight={hideLabels ? 0 : undefined}
          labelsDistanceFromXaxis={hideLabels ? 0 : undefined}
          disableScroll
          isAnimated={isAnimated}
          animationDuration={CHART_ANIMATION_MS}
          yAxisThickness={1}
          xAxisThickness={1}
          rulesThickness={1}
          backgroundColor={background}
          topLabelContainerStyle={{
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          topLabelTextStyle={{
            color: textColor,
            fontSize: 12,
            fontWeight: '600',
          }}
        />
      )}
    </View>
  );
}

function ChartColumn({
  data,
  height = 220,
  showValues = true,
  className,
  onLayout,
  isAnimated = true,
}: ChartColumnProps) {
  const { isDark, background, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  // The grid spans `noOfSections * stepValue`, so deriving maxValue from the step
  // keeps the bar scale and the axis identical. Passing a raw max instead lets the
  // two disagree whenever it isn't divisible by the section count, and the bars
  // then overshoot the x-axis line.
  const stepValue = Math.max(Math.ceil(Math.max(...data.map(item => item.value), 1) / AXIS_SECTIONS), 1);
  const maxValue = stepValue * AXIS_SECTIONS;

  const barChartData: barDataItem[] = data.map(item => ({
    value: item.value,
    frontColor: item.color,
    label: item.label,
    topLabelComponent: showValues
      ? () => (
          <Text className="text-[11px] font-semibold text-muted-foreground">
            {item.value}
          </Text>
        )
      : undefined,
  }));

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={onLayout}
    >
      <BarChart
        data={barChartData}
        height={height}
        maxValue={maxValue}
        stepValue={stepValue}
        noOfSections={AXIS_SECTIONS}
        barWidth={28}
        initialSpacing={16}
        spacing={24}
        endSpacing={16}
        barBorderTopLeftRadius={6}
        barBorderTopRightRadius={6}
        hideRules={false}
        rulesColor={axisColor}
        yAxisTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
        xAxisLabelTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
        xAxisColor={axisColor}
        yAxisColor={axisColor}
        yAxisLabelSuffix="h"
        backgroundColor={background}
        isAnimated={isAnimated}
        animationDuration={CHART_ANIMATION_MS}
      />
    </View>
  );
}

function ChartLine({
  data,
  height = 200,
  hideLabels,
  className,
  onLayout,
  isAnimated = true,
  area = true,
  curved = false,
}: ChartLineProps) {
  const { isDark, background, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const primary = data[0]?.color ?? FALLBACK_SERIES_COLOR;
  const { chartWidth, handleLayout } = useChartWidth(onLayout);

  const lineData: lineDataItem[] = data.map(item => ({
    value: item.value,
    ...(hideLabels ? {} : { label: item.label }),
    color: item.color,
    dataPointColor: item.color,
    dataPointRadius: 4,
  }));

  // gifted-charts always wires onPress onto the SVG data points, and on web
  // react-native-svg answers that by spraying RN responder props onto the DOM
  // node (React then logs "Unknown event handler property onResponderGrant", …).
  // A customDataPoint makes the library skip those touchable SVG circles, so web
  // renders the same dot as a plain view. Native keeps the SVG circles.
  const webDataPoint = isWeb
    ? (item: lineDataItem) => (
        <View
          style={{
            backgroundColor: item.dataPointColor ?? primary,
            borderRadius: DATA_POINT_SIZE / 2,
            height: DATA_POINT_SIZE,
            width: DATA_POINT_SIZE,
          }}
        />
      )
    : undefined;

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={handleLayout}
    >
      {chartWidth > 0 && (
        <LineChart
          data={lineData}
          width={chartWidth}
          height={height}
          noOfSections={4}
          color={primary}
          thickness={2}
          areaChart={area}
          curved={curved}
          startFillColor={primary}
          endFillColor={primary}
          startOpacity={0.35}
          endOpacity={0.03}
          hideRules={false}
          rulesColor={axisColor}
          yAxisTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelsHeight={hideLabels ? 0 : undefined}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          yAxisLabelSuffix="h"
          backgroundColor={background}
          isAnimated={isAnimated}
          animationDuration={CHART_ANIMATION_MS}
          {...(webDataPoint
            ? { customDataPoint: webDataPoint, dataPointsHeight: DATA_POINT_SIZE, dataPointsWidth: DATA_POINT_SIZE }
            : {})}
        />
      )}
    </View>
  );
}

function ChartStacked({
  data,
  height = 220,
  hideLabels,
  className,
  onLayout,
  isAnimated = true,
}: ChartStackedProps) {
  const { isDark, background, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const totalMax = Math.max(
    ...data.map(item => item.stacks.reduce((sum, stack) => sum + stack.value, 0)),
    1,
  );
  const { chartWidth, handleLayout } = useChartWidth(onLayout);

  const stackData: stackDataItem[] = data.map(item => ({
    ...(hideLabels ? {} : { label: item.label }),
    stacks: item.stacks.map(stack => ({
      value: stack.value,
      color: stack.color,
    })),
  }));

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={handleLayout}
    >
      {chartWidth > 0 && (
        <BarChart
          stackData={stackData}
          width={chartWidth}
          height={height}
          maxValue={Math.ceil(totalMax * 1.1)}
          noOfSections={4}
          barWidth={28}
          initialSpacing={16}
          spacing={24}
          endSpacing={16}
          hideRules={false}
          rulesColor={axisColor}
          yAxisTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelsHeight={hideLabels ? 0 : undefined}
          labelsDistanceFromXaxis={hideLabels ? 0 : undefined}
          disableScroll
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          yAxisLabelSuffix="h"
          backgroundColor={background}
          isAnimated={isAnimated}
          animationDuration={CHART_ANIMATION_MS}
        />
      )}
    </View>
  );
}

function ChartCandlestick({
  data,
  height = 200,
  className,
  onLayout,
  isAnimated = true,
}: ChartCandlestickProps) {
  const { isDark, background, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const maxHigh = Math.max(...data.map(item => item.high), 1);
  const { chartWidth, handleLayout } = useChartWidth(onLayout);

  // Without an explicit width the chart falls back to the device width and lays the
  // candles out at a fixed spacing, leaving the right side of the card empty.
  // Measuring the container and sizing the candles to their slot fills it at any width.
  const plotWidth = Math.max(chartWidth - Y_AXIS_GUTTER - CHART_EDGE_SPACING * 2, 0);
  const slotWidth = plotWidth / Math.max(data.length, 1);
  const candleWidth = Math.round(
    Math.min(Math.max(slotWidth * CANDLE_WIDTH_RATIO, MIN_CANDLE_WIDTH), MAX_CANDLE_WIDTH),
  );

  const candleData: candleStickDataItem[] = data.map(item => ({
    label: item.label,
    open: item.open,
    close: item.close,
    high: item.high,
    low: item.low,
    color: item.color,
  }));

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={handleLayout}
    >
      {chartWidth > 0 && (
        <CandleStickChart
          data={candleData}
          width={chartWidth}
          adjustToWidth
          height={height}
          maxValue={Math.ceil(maxHigh * 1.1)}
          noOfSections={4}
          barWidth={candleWidth}
          bullishBarWidth={candleWidth}
          bearishBarWidth={candleWidth}
          initialSpacing={CHART_EDGE_SPACING}
          endSpacing={CHART_EDGE_SPACING}
          disableScroll
          hideRules={false}
          rulesColor={axisColor}
          yAxisTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          backgroundColor={background}
          isAnimated={isAnimated}
          animationDuration={CHART_ANIMATION_MS}
        />
      )}
    </View>
  );
}

/** Same chart as {@link ChartLine}, pre-set to the filled, curved variant. */
function ChartArea(props: ChartLineProps) {
  return <ChartLine {...props} area curved />;
}

/** Running totals per bucket, so each band sits on top of the ones below it. */
function toCumulativeBands(series: ChartAreaSeries[], labels?: string[]) {
  const running: number[] = [];

  return series.map(entry => ({
    color: entry.color,
    points: entry.values.map((value, index) => {
      running[index] = (running[index] ?? 0) + value;
      return { value: running[index], ...(labels ? { label: labels[index] } : {}) };
    }) as lineDataItem[],
  }));
}

function ChartStackedArea({
  series,
  labels,
  height = 220,
  className,
  onLayout,
  isAnimated = true,
}: ChartStackedAreaProps) {
  const { isDark, background, muted } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const { chartWidth, handleLayout } = useChartWidth(onLayout);

  const bands = toCumulativeBands(series.slice(0, MAX_AREA_SERIES), labels);
  // gifted-charts paints data1 first, so the tallest band goes in first and the
  // shorter ones cover it — that reads as a stack instead of overlapping areas.
  const [top, middle, bottom] = [...bands].reverse();
  const maxValue = Math.max(...(top?.points.map(point => point.value ?? 0) ?? []), 1);

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      onLayout={handleLayout}
    >
      {chartWidth > 0 && top && (
        <LineChart
          data={top.points}
          data2={middle?.points}
          data3={bottom?.points}
          color1={top.color}
          color2={middle?.color}
          color3={bottom?.color}
          startFillColor1={top.color}
          endFillColor1={top.color}
          startFillColor2={middle?.color}
          endFillColor2={middle?.color}
          startFillColor3={bottom?.color}
          endFillColor3={bottom?.color}
          startOpacity={0.6}
          endOpacity={0.15}
          width={chartWidth}
          height={height}
          maxValue={Math.ceil(maxValue * 1.1)}
          noOfSections={4}
          areaChart
          curved
          thickness={2}
          // Data points are the only touchable SVG nodes here, and on web those
          // leak RN responder props onto the DOM — a stacked area reads fine without.
          hideDataPoints
          hideRules={false}
          rulesColor={axisColor}
          yAxisTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisLabelTextStyle={{ color: muted, fontSize: 11, fontWeight: '500' }}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          yAxisLabelSuffix="h"
          backgroundColor={background}
          isAnimated={isAnimated}
          animationDuration={CHART_ANIMATION_MS}
        />
      )}
    </View>
  );
}

export type {
  CandleItem,
  ChartAreaSeries,
  ChartBarsProps,
  ChartBarsVariant,
  ChartCandlestickProps,
  ChartColumnProps,
  ChartDataItem,
  ChartLineProps,
  ChartPieProps,
  ChartStackedAreaProps,
  ChartStackedProps,
  StackItem,
};
export {
  ChartArea,
  ChartBars,
  ChartCandlestick,
  ChartColumn,
  ChartLegend,
  ChartLine,
  ChartPie,
  ChartStacked,
  ChartStackedArea,
};
