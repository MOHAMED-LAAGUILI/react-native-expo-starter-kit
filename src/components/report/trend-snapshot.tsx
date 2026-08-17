import { ChartLoader, ChartTrend } from '@/components/ui';
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
      <ChartLoader delay={120} minHeight={150}>
        <ChartTrend data={chartData} />
      </ChartLoader>
    </ReportSection>
  );
}
