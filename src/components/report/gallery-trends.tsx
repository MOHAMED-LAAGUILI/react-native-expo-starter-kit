import type { ReportRange } from '@/data/report';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ChartArea, ChartCandlestick, ChartLine, ChartStackedArea } from '@/components/ui';
import { hoursTrend, sprintVelocity, trendSeriesColors, trendTotal } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { GalleryTile } from './gallery-tile';

const TREND_HEIGHT = 200;
const STACK_HEIGHT = 220;
const GAIN_COLOR = '#10b981';
const LOSS_COLOR = '#ef4444';

type GalleryTrendsProps = {
  range: ReportRange;
};

/** Time-series views: how hours accumulate across the selected range. */
function GalleryTrends({ range }: GalleryTrendsProps) {
  const { t } = useTranslation('report');
  const primaryHex = usePrimaryHex();

  const points = hoursTrend[range];
  const labels = points.map(point => point.label);

  const totals = points.map(point => ({
    value: Number(trendTotal(point).toFixed(1)),
    label: point.label,
    color: primaryHex,
  }));

  const bands = [
    { label: t('series.billable'), color: trendSeriesColors.billable, values: points.map(p => p.billable) },
    { label: t('series.internal'), color: trendSeriesColors.internal, values: points.map(p => p.internal) },
    { label: t('series.overtime'), color: trendSeriesColors.overtime, values: points.map(p => p.overtime) },
  ];

  const candles = sprintVelocity.map(sprint => ({
    label: sprint.label,
    open: sprint.open,
    close: sprint.close,
    high: sprint.high,
    low: sprint.low,
    color: sprint.close >= sprint.open ? GAIN_COLOR : LOSS_COLOR,
  }));

  return (
    <View className="flex-row flex-wrap items-start gap-4">
      <GalleryTile
        order={0}
        height={TREND_HEIGHT}
        title={t('charts.line.title')}
        subtitle={t('charts.line.subtitle')}
      >
        <ChartLine data={totals} height={TREND_HEIGHT} area={false} />
      </GalleryTile>

      <GalleryTile
        order={1}
        height={TREND_HEIGHT}
        title={t('charts.area.title')}
        subtitle={t('charts.area.subtitle')}
      >
        <ChartArea data={totals} height={TREND_HEIGHT} />
      </GalleryTile>

      <GalleryTile
        order={2}
        height={STACK_HEIGHT}
        title={t('charts.stackedArea.title')}
        subtitle={t('charts.stackedArea.subtitle')}
        legend={bands.map(band => ({ label: band.label, color: band.color }))}
      >
        <ChartStackedArea series={bands} labels={labels} height={STACK_HEIGHT} />
      </GalleryTile>

      <GalleryTile
        order={3}
        height={TREND_HEIGHT}
        title={t('charts.candlestick.title')}
        subtitle={t('charts.candlestick.subtitle')}
      >
        <ChartCandlestick data={candles} height={TREND_HEIGHT} />
      </GalleryTile>
    </View>
  );
}

export { GalleryTrends };
