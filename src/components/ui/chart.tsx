import type { LayoutChangeEvent } from 'react-native';
import type { barDataItem, lineDataItem, pieDataItem } from 'react-native-gifted-charts';
import * as React from 'react';
import { View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';

type ChartVariant = 'bar-vertical' | 'bar-horizontal' | 'pie' | 'trend' | 'line';

type ChartDataItem = {
  value: number;
  label?: string;
  color: string;
  tooltipText?: string;
  text?: string;
};

type ChartProps = {
  variant?: ChartVariant;
  data: ChartDataItem[];
  width?: number;
  height?: number;
  maxValue?: number;
  stepValue?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  donut?: boolean;
  radius?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerSubtitle?: string;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  hideLabels?: boolean;
};

function ChartLegend({ data }: { data: ChartDataItem[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View className="mt-6 gap-2">
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
}: ChartProps) {
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
        isAnimated
        centerLabelComponent={() => (
          <View className="items-center">
            {centerSubtitle && (
              <Text variant="caption" className="text-muted-foreground mb-1">
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

function ChartTrend({ data, className, onLayout }: ChartProps) {
  const maxHours = Math.max(...data.map(d => d.value), 1);

  return (
    <View className={cn('flex-row items-end justify-between gap-3', className)} onLayout={onLayout}>
      {data.map((item) => {
        const height = Math.max((item.value / maxHours) * 116, 18);

        return (
          <View key={`trend-${item.label}`} className="flex-1 items-center gap-2">
            <Text variant="caption" className="text-muted-foreground">
              {item.value}
              h
            </Text>
            <View className="bg-muted h-36 w-full justify-end overflow-hidden rounded-md px-1 pb-1">
              <View
                className="w-full rounded-lg"
                style={{
                  height,
                  backgroundColor: item.color,
                }}
              />
            </View>
            <Text
              variant="caption"
              className={cn('text-muted-foreground text-center')}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ChartLine({
  data,
  width,
  height,
  maxValue,
  stepValue,
  className,
  onLayout,
  hideLabels,
}: ChartProps) {
  const { isDark, background, muted } = useThemeColors();

  const axisColor = isDark ? '#404040' : '#e5e5e5';
  const computedMaxValue = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const computedStepValue = stepValue ?? Math.max(Math.ceil(computedMaxValue / 4), 1);

  const lineChartData: lineDataItem[] = data.map((item) => {
    const base: lineDataItem = {
      value: item.value,
      dataPointColor: item.color,
      dataPointRadius: 4,
      customDataPoint: () => (
        <View
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: item.color,
          }}
        />
      ),
    };
    if (!hideLabels) {
      base.label = item.label ?? '';
    }
    return base;
  });

  return (
    <View className={cn('w-full overflow-hidden rounded-xl', className)} onLayout={onLayout}>
      {width != null && width > 0 && (
        <LineChart
          data={lineChartData}
          width={width}
          adjustToWidth
          height={height}
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
          stepValue={computedStepValue}
          yAxisLabelSuffix="h"
          endSpacing={12}
          disableScroll
          isAnimated
          animationDuration={800}
          yAxisThickness={1}
          xAxisThickness={1}
          rulesThickness={1}
          backgroundColor={background}
          thickness={2}
          curved
          curveType={0}
          areaChart
          color={data[0]?.color}
          startFillColor={data[0]?.color}
          startOpacity={0.3}
          endFillColor={data[0]?.color}
          endOpacity={0}
        />
      )}
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
}: ChartProps) {
  const { isDark, background, muted } = useThemeColors();

  const axisColor = isDark ? '#404040' : '#e5e5e5';
  const textColor = isDark ? '#ffffff' : '#171717';
  const computedMaxValue = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const computedStepValue = stepValue ?? Math.max(Math.ceil(computedMaxValue / 4), 1);

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
          stepValue={computedStepValue}
          yAxisLabelSuffix="h"
          disableScroll
          isAnimated
          animationDuration={800}
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

function Chart({
  variant = 'bar-vertical',
  data,
  width = 0,
  height = 200,
  maxValue,
  stepValue,
  showLegend = false,
  showTooltip = true,
  donut = false,
  radius = 92,
  innerRadius = 62,
  centerLabel,
  centerSubtitle,
  className,
  onLayout,
  hideLabels,
}: ChartProps) {
  const shared = { data, width, height, maxValue, stepValue, className, onLayout, hideLabels };

  if (variant === 'pie') {
    return (
      <ChartPie
        {...shared}
        showLegend={showLegend}
        showTooltip={showTooltip}
        donut={donut}
        radius={radius}
        innerRadius={innerRadius}
        centerLabel={centerLabel}
        centerSubtitle={centerSubtitle}
      />
    );
  }

  if (variant === 'trend') {
    return <ChartTrend {...shared} />;
  }

  if (variant === 'line') {
    return <ChartLine {...shared} />;
  }

  return <ChartBars {...shared} variant={variant} />;
}

export type { ChartDataItem, ChartProps, ChartVariant };
export { Chart, ChartLegend };
