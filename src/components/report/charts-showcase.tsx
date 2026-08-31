import type { ReportProject, ReportRange } from '@/data/report';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { GalleryComparison } from './gallery-comparison';
import { GalleryDistribution } from './gallery-distribution';
import { GalleryProgress } from './gallery-progress';
import { GalleryTrends } from './gallery-trends';

type GalleryCategory = 'trends' | 'comparison' | 'distribution' | 'progress';

const CATEGORIES: GalleryCategory[] = ['trends', 'comparison', 'distribution', 'progress'];

type ChartsShowcaseProps = {
  data: ReportProject[];
  range: ReportRange;
  totalHours: number;
};

/**
 * Every chart type the kit ships, grouped by what the chart is for. Only the
 * selected group is mounted — gifted-charts animates on the JS thread, so
 * rendering all seventeen at once would stall the scroll on a phone.
 */
function ChartsShowcase({ data, range, totalHours }: ChartsShowcaseProps) {
  const { t } = useTranslation('report');
  const [category, setCategory] = React.useState<GalleryCategory>('trends');

  const handleSelect = (next: GalleryCategory) => {
    React.startTransition(() => setCategory(next));
  };

  return (
    <View className="mb-8 gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text variant="h4">{t('sections.gallery')}</Text>
        <Text variant="caption" className="text-muted-foreground">
          {t('sections.gallerySubtitle')}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map(key => (
          <Button
            key={key}
            size="sm"
            variant={category === key ? 'primary' : 'secondary'}
            title={t(`categories.${key}`)}
            onPress={() => handleSelect(key)}
          />
        ))}
      </View>

      {category === 'trends' && <GalleryTrends range={range} />}
      {category === 'comparison' && <GalleryComparison data={data} />}
      {category === 'distribution' && (
        <GalleryDistribution data={data} totalHours={totalHours} />
      )}
      {category === 'progress' && <GalleryProgress />}
    </View>
  );
}

export type { ChartsShowcaseProps, GalleryCategory };
export { ChartsShowcase };
