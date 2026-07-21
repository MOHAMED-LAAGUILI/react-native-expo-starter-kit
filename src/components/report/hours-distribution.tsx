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
    <View className="mt-6 gap-2">
      {data.map((project: any) => {
        const percent = getProjectPercent(project.hours, totalHours);

        return (
          <View
            key={`pie-${project.project}`}
            className="flex-row items-center justify-between px-2 py-1"
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="size-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <Text className="flex-1 text-sm font-medium">
                {project.project}
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
      bodyClassName="p-5"
    >
      <View className="items-center py-2">
        <PieChart
          data={pieChartData}
          donut
          radius={92}
          innerRadius={62}
          showTooltip
          showValuesAsTooltipText={false}
          focusOnPress
          sectionAutoFocus
          innerCircleColor={background}
          strokeColor={background}
          strokeWidth={2}
          isAnimated

          centerLabelComponent={() => (
            <View className="items-center">
              <Text variant="caption" className="mb-1 text-muted-foreground">
                Total
              </Text>
              <Text variant="h2" className="font-bold">
                {totalHours}
                <Text variant="caption" className="ml-0.5 text-muted-foreground">
                  h
                </Text>
              </Text>
            </View>
          )}
        />
      </View>
      <DistributionLegend data={data} totalHours={totalHours} />
    </ReportSection>
  );
}
