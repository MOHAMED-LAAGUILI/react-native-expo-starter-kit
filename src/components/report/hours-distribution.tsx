import React from 'react';
import { Chart } from '@/components/ui';
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
    </ReportSection>
  );
}
