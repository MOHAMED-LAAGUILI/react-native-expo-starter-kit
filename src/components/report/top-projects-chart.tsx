import type { LayoutChangeEvent } from 'react-native';
import type { barDataItem } from 'react-native-gifted-charts';
import React, { useState } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ReportSection } from './report-section';

type TopProjectsChartProps = {
  data: any[];
};

export function TopProjectsChart({
  data,
}: TopProjectsChartProps) {
  const [barChartWidth, setBarChartWidth] = useState(0);
  const { isDark } = useThemeColors();
  const axisColor = isDark ? '#404040' : '#e5e5e5';
  const mutedColor = isDark ? '#a3a3a3' : '#737373';
  const textColor = isDark ? '#ffffff' : '#171717';

  const hours = data.map((p: any) => p.hours);
  const maxHours = Math.max(...hours, 1);
  const stepValue = Math.max(Math.ceil(maxHours / 4), 1);
  const maxValue = stepValue * 4;

  const giftedBarData: barDataItem[] = data.map((project: any) => ({
    value: project.hours,
    label: project.project.replace('Project ', ''),
    frontColor: project.color,
    labelWidth: 54,
  }));

  const handleBarChartLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent) => {
    const nextWidth = Math.floor(layout.width);

    setBarChartWidth(currentWidth =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  };

  return (
    <ReportSection title="Top Projects" subtitle="Bar chart" bodyClassName="py-2">
      <View className="w-full overflow-hidden" onLayout={handleBarChartLayout}>
        {barChartWidth > 0 && (
          <BarChart
            data={giftedBarData}
            parentWidth={barChartWidth}
            adjustToWidth
            height={200}
            barBorderTopLeftRadius={3}
            barBorderTopRightRadius={3}
            initialSpacing={10}
            hideRules={false}
            rulesColor={axisColor}
            yAxisTextStyle={{ color: mutedColor, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: mutedColor,
              fontSize: 10,
              textAlign: 'center',
            }}
            xAxisColor={axisColor}
            yAxisColor={axisColor}
            noOfSections={4}
            maxValue={maxValue}
            stepValue={stepValue}
            yAxisLabelSuffix="h"
            showValuesAsTopLabel
            topLabelContainerStyle={{
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            topLabelTextStyle={{ color: textColor, fontSize: 11 }}
            disableScroll
            isAnimated
          />
        )}
      </View>
    </ReportSection>
  );
}
