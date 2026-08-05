import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Chart, Spinner } from '@/components/ui';
import { ReportSection } from './report-section';

type TrendSnapshotProps = {
  data: any[];
  rangeLabel: string;
};

export function TrendSnapshot({
  data,
  rangeLabel,
}: TrendSnapshotProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(setIsLoading, 100, false);
    return () => clearTimeout(timer);
  }, [data]);

  const chartData = data.map((project: any) => ({
    value: project.hours,
    label: project.project.replace('Project ', ''),
    color: project.color,
  }));

  return (
    <ReportSection title="Trend Snapshot" subtitle={rangeLabel} bodyClassName="p-4">
      {isLoading
        ? (
            <View className="h-37.5 items-center justify-center">
              <Spinner size="lg" />
            </View>
          )
        : (
            <Chart variant="trend" data={chartData} />
          )}
    </ReportSection>
  );
}
