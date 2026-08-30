import { CalendarIcon } from 'lucide-react-native';

import { View } from 'react-native';
import { Tabs, TabsList, TabsTrigger, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';

type ReportTabsProps<T extends string> = {
  activeTab: T;
  tabs: Array<{ key: T; label: string }>;
  onTabChange: (tab: T) => void;
};

export function ReportTabs<T extends string>({
  activeTab,
  tabs,
  onTabChange,
}: ReportTabsProps<T>) {
  const { muted, text } = useThemeColors();

  return (
    <View className="border-b border-border px-1 py-2">
      <Tabs
        value={activeTab}
        onValueChange={tab => onTabChange(tab as T)}
      >
        <TabsList className="w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex-1"
              >
                <CalendarIcon
                  size={18}
                  color={isActive ? text : muted}
                />
                <Text variant="caption" className="font-semibold">
                  {tab.label}
                </Text>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </View>
  );
}
