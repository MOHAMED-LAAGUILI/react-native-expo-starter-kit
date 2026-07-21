import React from 'react';
import { Chart } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { ReportSection } from './report-section';

type LineTrendProps = {
  data: any[];
};

export function LineTrend({
  data,
}: LineTrendProps) {
  const [chartWidth, setChartWidth] = React.useState(0);
  const primaryHex = usePrimaryHex();

  const chartData = data.map((project: any) => ({
    value: project.hours,
    label: project.project,
    color: primaryHex,
    tooltipText: `${project.project}: ${project.hours} h`,
  }));

  return (
    <ReportSection
      title="Trend Analysis"
      subtitle="Line chart"
      bodyClassName="p-4"
    >
      <Chart
        variant="line"
        data={chartData}
        width={chartWidth}
        height={200}
        onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
      />
    </ReportSection>
  );
}
