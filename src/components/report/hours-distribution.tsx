import type { ReportProject } from '@/data/report';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  ChartPie,
  ChartSkeleton,
  ChartSkeletonList,
} from '@/components/ui';
import { useChartReady } from '@/hooks/use-chart-ready';
import { isWeb } from '@/utils/platform';
import { ProjectsAllocationList } from './projects-allocation-list';
import { ReportSection } from './report-section';

type HoursDistributionProps = {
  data: ReportProject[];
  totalHours: number;
};

function getProjectPercent(hours: number, totalHours: number) {
  return totalHours === 0 ? 0 : (hours / totalHours) * 100;
}

export function HoursDistribution({
  data,
  totalHours,
}: HoursDistributionProps) {
  const { t } = useTranslation('report');
  const ready = useChartReady(0);

  const chartData = data.map((project) => {
    const percent = Math.round(getProjectPercent(project.hours, totalHours));

    return {
      value: project.hours,
      label: project.project,
      color: project.color,
      // Slice labels overlap the donut's center summary on narrow native screens.
      text: isWeb ? `${percent}%` : undefined,
      tooltipText: `${project.project}: ${project.hours} h`,
    };
  });

  return (
    <ReportSection
      title={t('sections.hoursDistribution')}
      subtitle={t('sections.hoursDistributionSubtitle')}
    >
      {ready
        ? (
            <View className="gap-2">
              <ChartPie
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
            </View>
          )
        : (
            <View className="gap-2">
              <ChartSkeleton height={184} />
              <ChartSkeletonList rows={3} />
            </View>
          )}
    </ReportSection>
  );
}
