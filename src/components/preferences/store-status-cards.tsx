import { Database } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { StorageService } from '@/storage';

function StoreStatusCards() {
  const stores = StorageService.getAllStores();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {stores.map((store) => {
        const statusColor = store.status.alive ? '#22c55e' : '#ef4444';
        return (
          <View key={store.id} className="flex-wrap gap-5 rounded-xl border border-border bg-card p-3">
            <View className="mb-1 flex-row items-center gap-2">
              <Database size={14} color={statusColor} />
              <Text variant="caption">{store.id.replace('app-', '')}</Text>
              <View className="size-2 rounded-full" style={{ backgroundColor: statusColor }} />
            </View>
            <View className="gap-0.5">
              <Text variant="caption" className="text-[11px] text-muted-foreground">
                Driver:
                {store.status.driver}
              </Text>
              <Text variant="caption" className="text-[11px] text-muted-foreground">
                Alive:
                {store.status.alive ? 'Yes' : 'No'}
              </Text>
              <Text variant="caption" className="text-[11px] text-muted-foreground">
                Keys:
                {store.status.keyCount}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export { StoreStatusCards };
