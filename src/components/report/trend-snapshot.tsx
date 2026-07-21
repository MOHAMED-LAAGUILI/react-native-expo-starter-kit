import React from 'react';

import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/utils/utils';
import { ReportSection } from './report-section';

type TrendSnapshotProps = {
  data: any[];
  rangeLabel: string;
};

export function TrendSnapshot({
  data,
  rangeLabel,
}: TrendSnapshotProps) {
  const hours = data.map((p: any) => p.hours);
  const maxHours = Math.max(...hours, 1);

  return (
    <ReportSection title="Trend Snapshot" subtitle={rangeLabel} bodyClassName="p-4">
      <View className="flex-row items-end justify-between gap-3">
        {data.map((project: any) => {
          const height = Math.max((project.hours / maxHours) * 116, 18);

          return (
            <View key={project.project} className="flex-1 items-center gap-2">
              <Text variant="caption" className="text-muted-foreground">
                {project.hours}
                h
              </Text>
              <View className="h-36 w-full justify-end overflow-hidden rounded-md bg-muted px-1 pb-1">
                <View
                  className="w-full rounded-lg"
                  style={{
                    height,
                    backgroundColor: project.color,
                  }}
                />
              </View>
              <Text
                variant="caption"
                className={cn('text-center text-muted-foreground')}
                numberOfLines={2}
              >
                {project.project.replace('Project ', '')}
              </Text>
            </View>
          );
        })}
      </View>
    </ReportSection>
  );
}
