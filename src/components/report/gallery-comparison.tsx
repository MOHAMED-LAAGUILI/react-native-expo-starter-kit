import type { ReportProject } from '@/data/report';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ChartBars, ChartColumn, ChartScatter, ChartStacked } from '@/components/ui';
import { teamThroughput } from '@/data/report';
import { useChartWidth } from '@/hooks/use-chart-width';
import { GalleryTile } from './gallery-tile';

const CHART_HEIGHT = 200;
const STACK_HEIGHT = 220;
/** Split used by the stacked bars: what was logged against a project vs what was billed on. */
const BILLED_SHARE = 0.6;

type GalleryComparisonProps = {
  data: ReportProject[];
};

/** Side-by-side views: how projects and teammates compare to each other. */
function GalleryComparison({ data }: GalleryComparisonProps) {
  const { t } = useTranslation('report');
  const { chartWidth, handleLayout } = useChartWidth();

  const projectSeries = data.map(project => ({
    value: project.hours,
    label: project.project,
    color: project.color,
  }));

  const stackedSeries = data.map(project => ({
    label: project.project,
    stacks: [
      { value: Math.round(project.hours * BILLED_SHARE), color: project.color },
      { value: project.hours - Math.round(project.hours * BILLED_SHARE), color: `${project.color}66` },
    ],
  }));

  const teamPoints = teamThroughput.map(member => ({
    label: member.name,
    x: member.tasks,
    y: member.hours,
    weight: member.reviews,
    color: member.color,
  }));

  const teamLegend = teamThroughput.map(member => ({ label: member.name, color: member.color }));

  return (
    <View className="flex-row flex-wrap items-start gap-4">
      <GalleryTile
        order={0}
        height={CHART_HEIGHT}
        title={t('charts.bar.title')}
        subtitle={t('charts.bar.subtitle')}
        legend={projectSeries.map(item => ({ label: item.label, color: item.color }))}
      >
        <ChartBars
          variant="bar-horizontal"
          data={projectSeries}
          width={chartWidth}
          height={CHART_HEIGHT}
          hideLabels
          onLayout={handleLayout}
        />
      </GalleryTile>

      <GalleryTile
        order={1}
        height={STACK_HEIGHT}
        title={t('charts.column.title')}
        subtitle={t('charts.column.subtitle')}
      >
        <ChartColumn data={projectSeries} height={STACK_HEIGHT} />
      </GalleryTile>

      <GalleryTile
        order={2}
        height={STACK_HEIGHT}
        title={t('charts.stackedBar.title')}
        subtitle={t('charts.stackedBar.subtitle')}
        legend={[
          { label: t('series.billed'), color: data[0]?.color ?? '#6366f1' },
          { label: t('series.logged'), color: `${data[0]?.color ?? '#6366f1'}66` },
        ]}
      >
        <ChartStacked data={stackedSeries} height={STACK_HEIGHT} hideLabels />
      </GalleryTile>

      <GalleryTile
        order={3}
        height={CHART_HEIGHT}
        title={t('charts.scatter.title')}
        subtitle={t('charts.scatter.subtitle')}
        legend={teamLegend}
      >
        <ChartScatter data={teamPoints} height={CHART_HEIGHT} />
      </GalleryTile>

      <GalleryTile
        order={4}
        height={CHART_HEIGHT}
        title={t('charts.bubble.title')}
        subtitle={t('charts.bubble.subtitle')}
        legend={teamLegend}
      >
        <ChartScatter data={teamPoints} height={CHART_HEIGHT} bubble />
      </GalleryTile>
    </View>
  );
}

export { GalleryComparison };
