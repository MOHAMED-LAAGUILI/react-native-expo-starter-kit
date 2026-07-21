import React from 'react';

import { Chart } from '@/components/ui';
import { ReportSection } from './report-section';

type TrendSnapshotProps = {
  data: any[];
  rangeLabel: string;
};

export function TrendSnapshot({
  data,
  rangeLabel,
}: TrendSnapshotProps) {
  const chartData = data.map((project: any) => ({
    value: project.hours,
    label: project.project.replace('Project ', ''),
    color: project.color,
  }));

  return (
    <ReportSection title="Trend Snapshot" subtitle={rangeLabel} bodyClassName="p-4">
      <Chart variant="trend" data={chartData} />
    </ReportSection>
  );
}
