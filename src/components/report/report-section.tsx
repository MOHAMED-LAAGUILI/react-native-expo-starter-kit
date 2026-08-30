import type { ReactNode } from 'react';

import { View } from 'react-native';
import { Card, Text } from '@/components/ui';

type ReportSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ReportSection({
  title,
  subtitle,
  children,
}: ReportSectionProps) {
  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text variant="h4">{title}</Text>
        {subtitle && (
          <Text variant="caption" className="text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>
      <Card variant="stats">{children}</Card>
    </View>
  );
}
