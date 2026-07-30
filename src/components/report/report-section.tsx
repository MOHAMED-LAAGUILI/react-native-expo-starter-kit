import type { ReactNode } from 'react';
import React from 'react';

import { View } from 'react-native';
import { Text } from '@/components/ui';

type ReportSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyClassName?: string;
};

export function ReportSection({
  title,
  subtitle,
  children,
  bodyClassName,
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
      <View className={`border-border bg-card rounded-xl border ${bodyClassName ?? ''}`}>
        {children}
      </View>
    </View>
  );
}
