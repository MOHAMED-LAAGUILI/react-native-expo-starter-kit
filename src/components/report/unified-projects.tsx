import type { LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Chart } from '@/components/ui';
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
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent) => {
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
      bodyClassName="p-4"
    >
      <View className="gap-1">
        <Chart
          variant="bar-vertical"
          data={chartData}
          width={chartWidth}
          height={200}
          onLayout={handleLayout}
        />

        <ProjectsAllocationList
          data={data}
          totalHours={totalHours}
        />
      </View>
    </ReportSection>
  );
}
