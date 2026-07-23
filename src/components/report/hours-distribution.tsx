import React from 'react';
import { Platform } from 'react-native';
import { Chart } from '@/components/ui';
import { ProjectsAllocationList } from './projects-allocation-list';
import { ReportSection } from './report-section';

type HoursDistributionProps = {
  data: any[];
  totalHours: number;
};

function getProjectPercent(hours: number, totalHours: number) {
  return totalHours === 0 ? 0 : (hours / totalHours) * 100;
}

export function HoursDistribution({
  data,
  totalHours,
}: HoursDistributionProps) {
  const chartData = data.map((project: any) => {
    const percent = Math.round(getProjectPercent(project.hours, totalHours));

    return {
      value: project.hours,
      label: project.project,
      color: project.color,
      // Slice labels overlap the donut's center summary on narrow native screens.
      text: Platform.OS === 'web' ? `${percent}%` : undefined,
      tooltipText: `${project.project}: ${project.hours} h`,
    };
  });

  return (
    <ReportSection
      title="Hours Distribution"
      subtitle="Donut chart"
      bodyClassName="p-5"
    >
      <Chart
        variant="pie"
        data={chartData}
        donut
        radius={92}
        innerRadius={62}
        showTooltip
        centerLabel={`${totalHours}h`}
        centerSubtitle="Total"
      />
      <ProjectsAllocationList
        data={data}
        totalHours={totalHours}
      />
    </ReportSection>
  );
}
