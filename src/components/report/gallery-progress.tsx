import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ChartProgressRing, ChartRadialBar } from '@/components/ui';
import { goalProgress } from '@/data/report';
import { GalleryTile } from './gallery-tile';

const RING_HEIGHT = 180;
const RADIAL_HEIGHT = 220;
/** Goals are already expressed in percent, so every track shares the same full-scale value. */
const GOAL_SCALE = 100;

/** Goal views: how far along each quarterly objective is. */
function GalleryProgress() {
  const { t } = useTranslation('report');

  const [headline] = goalProgress;

  const goalSeries = goalProgress.map(goal => ({
    value: goal.percent,
    label: goal.label,
    color: goal.color,
  }));

  const goalLegend = goalProgress.map(goal => ({
    label: goal.label,
    color: goal.color,
    value: `${goal.percent}%`,
  }));

  return (
    <View className="flex-row flex-wrap items-start gap-4">
      <GalleryTile
        order={0}
        height={RING_HEIGHT}
        title={t('charts.progressRing.title')}
        subtitle={t('charts.progressRing.subtitle')}
      >
        <View className="items-center">
          <ChartProgressRing
            value={headline?.percent ?? 0}
            max={GOAL_SCALE}
            color={headline?.color ?? '#6366f1'}
            sublabel={headline?.label}
          />
        </View>
      </GalleryTile>

      <GalleryTile
        order={1}
        height={RADIAL_HEIGHT}
        title={t('charts.radialBar.title')}
        subtitle={t('charts.radialBar.subtitle')}
        legend={goalLegend}
      >
        <ChartRadialBar data={goalSeries} maxValue={GOAL_SCALE} />
      </GalleryTile>
    </View>
  );
}

export { GalleryProgress };
