import type { pieDataItem } from 'react-native-gifted-charts';

import React from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ReportSection } from './report-section';

type HoursDistributionProps = {
  data: any[];
  totalHours: number;
};

function getProjectPercent(hours: number, totalHours: number) {
  return totalHours === 0 ? 0 : (hours / totalHours) * 100;
}

function DistributionLegend({
  data,
  totalHours,
}: Pick<HoursDistributionProps, 'data' | 'totalHours'>) {
  return (
    <View className="mt-5 gap-3">
      {data.map((project: any) => {
        const percent = getProjectPercent(project.hours, totalHours);

        return (
          <View
            key={`pie-${project.project}`}
            className="flex-row items-center justify-between gap-3"
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="size-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <Text className="flex-1 text-sm font-medium">
                {project.project}
              </Text>
            </View>
            <Text variant="caption" className="text-muted-foreground">
              {percent.toFixed(0)}
              %
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function HoursDistribution({
  data,
  totalHours,
}: HoursDistributionProps) {
  const { background } = useThemeColors();

  const pieChartData: pieDataItem[] = data.map((project: any) => {
    const percent = Math.round(
      getProjectPercent(project.hours, totalHours),
    );

    return {
      value: project.hours,
      color: project.color,
      text: `${percent}%`,
      tooltipText: `${project.project}: ${project.hours} h`,
    };
  });

  return (
    <ReportSection
      title="Hours Distribution"
      subtitle="Donut chart"
      bodyClassName="p-4"
    >
      <View className="items-center">
        <PieChart
          data={pieChartData}
          donut
          radius={88}
          innerRadius={58}
          innerCircleColor={background}
          showTooltip
          showValuesAsTooltipText={false}
          focusOnPress
          sectionAutoFocus
          centerLabelComponent={() => (
            <View className="items-center">
              <Text variant="caption" className="text-muted-foreground">
                Total
              </Text>
              <Text variant="h2">
                {totalHours}
                h
              </Text>
            </View>
          )}
        />
      </View>
      <DistributionLegend data={data} totalHours={totalHours} />
    </ReportSection>
  );
}
