import type { Entry } from '@/data/preferences-info';
import { View } from 'react-native';
import { Text } from '@/components/ui';

function StorageEntriesList({ entries }: { entries: Entry[] }) {
  return (
    <View className="gap-3">
      {entries.length > 0 && (
        <Text variant="label" className="text-xs tracking-wider text-muted-foreground uppercase">Raw Storage</Text>
      )}
      {entries.map(entry => (
        <View key={entry.key} className="rounded-xl border border-border bg-card p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text variant="caption" className="text-muted-foreground">{entry.label}</Text>
            <View className="flex-row items-center gap-2">
              <Text variant="caption" className="font-mono text-[10px] text-muted-foreground/50">{entry.store}</Text>
              <Text variant="caption" className="font-mono text-[10px] text-muted-foreground/50">{entry.key}</Text>
            </View>
          </View>
          <Text variant="body" className="font-mono text-sm/5" selectable>{entry.value}</Text>
        </View>
      ))}
    </View>
  );
}

export { StorageEntriesList };
