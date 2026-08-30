import type { LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ChartBars,
  ChartSkeleton,
  ChartSkeletonList,
} from '@/components/ui';
import { useChartReady } from '@/hooks/use-chart-ready';
import { ProjectsAllocationList } from './projects-allocation-list';
import { ReportSection } from './report-section';

type Project = {
  project: string;
  hours: number;
  color: string;
};

type UnifiedProjectsProps = {
  data: Project[];
  totalHours: number;
};

export function UnifiedProjects({
  data,
  totalHours,
}: UnifiedProjectsProps) {
  const ready = useChartReady(1);
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    const width = Math.floor(layout.width);
    setChartWidth(current => (current === width ? current : width));
  };

  const chartData = data.map(project => ({
    value: project.hours,
    label: project.project,
    color: project.color,
  }));

  return (
    <ReportSection
      title="Projects Overview"
      subtitle="Allocation & Top Projects"
    >
      {ready
        ? (
            <View className="gap-4">
              <ChartBars
                variant="bar-vertical"
                data={chartData}
                width={chartWidth}
                height={200}
                hideLabels
                onLayout={handleLayout}
              />

              <ProjectsAllocationList
                data={data}
                totalHours={totalHours}
              />
            </View>
          )
        : (
            <View className="gap-4">
              <ChartSkeleton height={200} />
              <ChartSkeletonList rows={4} />
            </View>
          )}
    </ReportSection>
  );
}
