import type { LayoutChangeEvent } from 'react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Chart, Spinner } from '@/components/ui';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(setIsLoading, 100, false);
    return () => clearTimeout(timer);
  }, [data]);

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
        {isLoading
          ? (
              <View className="h-50 items-center justify-center">
                <Spinner size="lg" />
              </View>
            )
          : (
              <Chart
                variant="bar-vertical"
                data={chartData}
                width={chartWidth}
                height={200}
                onLayout={handleLayout}
                hideLabels
              />
            )}

        <ProjectsAllocationList
          data={data}
          totalHours={totalHours}
        />
      </View>
    </ReportSection>
  );
}
