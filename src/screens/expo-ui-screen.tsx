import * as Battery from 'expo-battery';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

type BatteryInfoRow = {
  label: string;
  value: string;
};

function batteryStateLabel(state: Battery.BatteryState): string {
  const labels: Record<number, string> = {
    [Battery.BatteryState.UNKNOWN]: 'Unknown',
    [Battery.BatteryState.UNPLUGGED]: 'Unplugged',
    [Battery.BatteryState.CHARGING]: 'Charging',
    [Battery.BatteryState.FULL]: 'Full',
  };
  return labels[state] ?? `Unknown (${state})`;
}

export function ExpoUiScreen() {
  const [rows, setRows] = React.useState<BatteryInfoRow[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const items: BatteryInfoRow[] = [];

      try {
        const level = await Battery.getBatteryLevelAsync();
        items.push({
          label: 'Battery Level',
          value: level >= 0 ? `${(level * 100).toFixed(0)}%` : '—',
        });
      }
      catch {}

      try {
        const state = await Battery.getBatteryStateAsync();
        items.push({ label: 'Battery State', value: batteryStateLabel(state) });
      }
      catch {}

      try {
        const lowPower = await Battery.isLowPowerModeEnabledAsync();
        items.push({ label: 'Low Power Mode', value: lowPower ? 'Yes' : 'No' });
      }
      catch {}

      setRows(items);
    };

    load();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View className="w-full gap-4 p-6">
          <Text variant="h2">Expo Battery</Text>
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {rows.map((row, index) => (
              <View key={row.label}>
                {index > 0 && <View className="mx-4 h-px bg-border" />}
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text variant="body" className="shrink text-muted-foreground">{row.label}</Text>
                  <Text variant="body" className="ml-2 flex-1 text-right font-medium">{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
