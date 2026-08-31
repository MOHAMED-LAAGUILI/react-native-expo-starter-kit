import type { ReportProject } from '@/data/report';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  ChartHeatmap,
  ChartPie,
  ChartPolarArea,
  ChartRadar,
  ChartTreemap,
} from '@/components/ui';
import { activityHeatmap, reportWeekdays, workBreakdown } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { GalleryTile } from './gallery-tile';

const PIE_RADIUS = 88;
const DONUT_INNER_RADIUS = 58;
const ROUND_HEIGHT = 200;
const TREEMAP_HEIGHT = 220;
const HEATMAP_HEIGHT = 200;

type GalleryDistributionProps = {
  data: ReportProject[];
  totalHours: number;
};

/** Part-to-whole views: how one total splits across projects and kinds of work. */
function GalleryDistribution({ data, totalHours }: GalleryDistributionProps) {
  const { t } = useTranslation('report');
  const primaryHex = usePrimaryHex();

  const workSeries = workBreakdown.map(item => ({
    value: item.hours,
    label: item.label,
    color: item.color,
  }));

  const workLegend = workBreakdown.map(item => ({
    label: item.label,
    color: item.color,
    value: `${item.hours}h`,
  }));

  const projectSeries = data.map(project => ({
    value: project.hours,
    label: project.project,
    color: project.color,
  }));

  const heatmapRows = activityHeatmap.map(week => ({
    label: week.label,
    values: week.hours,
  }));

  return (
    <View className="flex-row flex-wrap items-start gap-4">
      <GalleryTile
        order={0}
        height={ROUND_HEIGHT}
        title={t('charts.pie.title')}
        subtitle={t('charts.pie.subtitle')}
        legend={workLegend}
      >
        <ChartPie data={workSeries} radius={PIE_RADIUS} />
      </GalleryTile>

      <GalleryTile
        order={1}
        height={ROUND_HEIGHT}
        title={t('charts.doughnut.title')}
        subtitle={t('charts.doughnut.subtitle')}
        legend={projectSeries.map(item => ({ label: item.label, color: item.color }))}
      >
        <ChartPie
          data={projectSeries}
          donut
          radius={PIE_RADIUS}
          innerRadius={DONUT_INNER_RADIUS}
          centerLabel={`${totalHours}h`}
          centerSubtitle={t('series.total')}
        />
      </GalleryTile>

      <GalleryTile
        order={2}
        height={ROUND_HEIGHT}
        title={t('charts.polarArea.title')}
        subtitle={t('charts.polarArea.subtitle')}
        legend={workLegend}
      >
        <ChartPolarArea data={workSeries} />
      </GalleryTile>

      <GalleryTile
        order={3}
        height={ROUND_HEIGHT}
        title={t('charts.radar.title')}
        subtitle={t('charts.radar.subtitle')}
        legend={workLegend}
      >
        <ChartRadar data={workSeries} />
      </GalleryTile>

      <GalleryTile
        order={4}
        height={TREEMAP_HEIGHT}
        title={t('charts.treemap.title')}
        subtitle={t('charts.treemap.subtitle')}
      >
        <ChartTreemap data={workSeries} height={TREEMAP_HEIGHT} />
      </GalleryTile>

      <GalleryTile
        order={5}
        height={HEATMAP_HEIGHT}
        title={t('charts.heatmap.title')}
        subtitle={t('charts.heatmap.subtitle')}
      >
        <ChartHeatmap
          data={heatmapRows}
          columns={reportWeekdays}
          color={primaryHex}
          scaleLabels={{ less: t('heatmap.less'), more: t('heatmap.more') }}
        />
      </GalleryTile>
    </View>
  );
}

export { GalleryDistribution };
