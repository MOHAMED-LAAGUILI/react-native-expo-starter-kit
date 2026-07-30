import { CalendarIcon } from 'lucide-react-native';

import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';

type ReportTabsProps = {
  activeTab: any;
  tabs: any[];
  onTabChange: (tab: any) => void;
};

export function ReportTabs({
  activeTab,
  tabs,
  onTabChange,
}: ReportTabsProps) {
  const { muted } = useThemeColors();

  return (
    <View className="border-b border-border px-1 py-2">
      <View className="flex-row justify-center rounded-md bg-muted p-1">
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-sm p-1',
              activeTab === tab.key ? 'bg-primary' : 'bg-transparent',
            )}
          >
            <CalendarIcon
              size={18}
              color={activeTab === tab.key ? 'white' : muted}
            />
            <Text
              variant="caption"
              className={cn(
                'font-semibold',
                activeTab === tab.key ? 'text-white' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
