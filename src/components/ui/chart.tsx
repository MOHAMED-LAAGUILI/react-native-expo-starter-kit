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
  RadarChart,
} from 'react-native-gifted-charts';

import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
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
};

type ChartRadarProps = ChartBaseProps & {
  chartSize?: number;
  isAnimated?: boolean;
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

function getAxisColor(isDark: boolean) {
  return isDark ? '#404040' : '#e5e5e5';
}

function useChartWidth(onLayout?: (event: LayoutChangeEvent) => void) {
  const [chartWidth, setChartWidth] = React.useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.floor(event.nativeEvent.layout.width);
    setChartWidth(current => (current === width ? current : width));
    onLayout?.(event);
  };

  return { chartWidth, handleLayout };
}

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

  const barChartData: barDataItem[] = data.map((item) => {
    const base: barDataItem = {
      value: item.value,
      frontColor: item.color,
      labelWidth: 0,
      barWidth: variant === 'bar-horizontal' ? 32 : 24,
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
          horizontal={variant === 'bar-horizontal'}
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
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const stepValue = Math.max(Math.ceil(maxValue / 4), 1);

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
        noOfSections={4}
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
          areaChart
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
        />
      )}
    </View>
  );
}

function ChartRadar({
  data,
  chartSize = 220,
  className,
  onLayout,
  isAnimated = true,
}: ChartRadarProps) {
  const { isDark } = useThemeColors();
  const axisColor = getAxisColor(isDark);
  const primary = data[0]?.color ?? FALLBACK_SERIES_COLOR;

  const values = data.map(item => item.value);
  const labels = data.map(item => item.label ?? '');
  const maxValue = Math.max(...values, 1);

  return (
    <View
      className={cn('w-full items-center', className)}
      onLayout={onLayout}
    >
      <RadarChart
        data={values}
        labels={labels}
        maxValue={maxValue}
        noOfSections={4}
        chartSize={chartSize}
        labelsPositionOffset={18}
        labelConfig={{ fontSize: 12, fontWeight: '600', textAnchor: 'middle' }}
        gridConfig={{
          stroke: axisColor,
          strokeWidth: 1,
          strokeDashArray: [6, 4],
          opacity: 0.85,
        }}
        asterLinesConfig={{
          stroke: axisColor,
          strokeWidth: 1,
          strokeDashArray: [2, 4],
        }}
        polygonConfig={{
          stroke: primary,
          strokeWidth: 2.5,
          fill: primary,
          showGradient: true,
          gradientColor: primary,
          opacity: 0.35,
          gradientOpacity: 0.95,
        }}
        isAnimated={isAnimated}
        animationDuration={CHART_ANIMATION_MS}
      />
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
      onLayout={onLayout}
    >
      <CandleStickChart
        data={candleData}
        height={height}
        maxValue={Math.ceil(maxHigh * 1.1)}
        noOfSections={4}
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
    </View>
  );
}

export type {
  CandleItem,
  ChartBarsProps,
  ChartBarsVariant,
  ChartCandlestickProps,
  ChartColumnProps,
  ChartDataItem,
  ChartLineProps,
  ChartPieProps,
  ChartRadarProps,
  ChartStackedProps,
  StackItem,
};
export {
  ChartBars,
  ChartCandlestick,
  ChartColumn,
  ChartLegend,
  ChartLine,
  ChartPie,
  ChartRadar,
  ChartStacked,
};
