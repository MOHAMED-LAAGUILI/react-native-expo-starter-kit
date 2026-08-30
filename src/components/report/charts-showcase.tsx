import { View } from 'react-native';
import {
  ChartLine,
  ChartSkeleton,
  ChartSkeletonList,
  ChartStacked,
} from '@/components/ui';
import { useChartReady } from '@/hooks/use-chart-ready';
import { ProjectsAllocationList } from './projects-allocation-list';
import { ReportSection } from './report-section';

type Project = {
  project: string;
  hours: number;
  color: string;
};

type ChartsShowcaseProps = {
  data: Project[];
  totalHours: number;
};

function buildStacks(project: Project) {
  return [
    { value: Math.round(project.hours * 0.6), color: project.color },
    { value: Math.round(project.hours * 0.4), color: `${project.color}66` },
  ];
}

export function ChartsShowcase({ data, totalHours }: ChartsShowcaseProps) {
  const ready = useChartReady(2);

  const chartData = data.map(project => ({
    value: project.hours,
    label: project.project,
    color: project.color,
  }));

  const stackedData = data.map(project => ({
    label: project.project,
    stacks: buildStacks(project),
  }));

  const stackedListData = data.map(project => ({
    project: project.project,
    hours: project.hours,
    color: project.color,
    stacks: buildStacks(project),
  }));

  const lineSection = ready
    ? (
        <View className="gap-4">
          <ChartLine data={chartData} hideLabels />
          <ProjectsAllocationList data={data} totalHours={totalHours} />
        </View>
      )
    : (
        <View className="gap-4">
          <ChartSkeleton height={200} />
          <ChartSkeletonList rows={3} />
        </View>
      );

  const stackedSection = ready
    ? (
        <View className="gap-4">
          <ChartStacked data={stackedData} hideLabels />
          <ProjectsAllocationList data={stackedListData} totalHours={totalHours} />
        </View>
      )
    : (
        <View className="gap-4">
          <ChartSkeleton height={220} />
          <ChartSkeletonList rows={3} />
        </View>
      );

  return (
    <>
      <ReportSection title="Line Chart" subtitle="Hours trend">
        {lineSection}
      </ReportSection>

      <ReportSection title="Stacked Bars" subtitle="Logged vs billed">
        {stackedSection}
      </ReportSection>
    </>
  );
}
