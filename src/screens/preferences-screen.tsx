import { useFocusEffect } from 'expo-router';
import { Database, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { STORAGE_KEYS } from '@/config/constants';
import { StorageService } from '@/storage';

const KEY_LABELS: Record<string, string> = {
  [STORAGE_KEYS.AUTH_TOKEN]: 'Auth Token',
  [STORAGE_KEYS.AUTH_REFRESH_TOKEN]: 'Auth Refresh Token',
  [STORAGE_KEYS.AUTH_USER]: 'Auth User',
  [STORAGE_KEYS.LANGUAGE]: 'Language',
  [STORAGE_KEYS.ONBOARDING_COMPLETE]: 'Onboarding Complete',
  [STORAGE_KEYS.PRIMARY_COLOR]: 'Primary Color',
  [STORAGE_KEYS.THEME_MODE]: 'Theme Mode',
};

type Entry = {
  key: string;
  label: string;
  value: string;
  store: string;
};

function readAllKeys(): Entry[] {
  const entries: Entry[] = [];
  for (const store of [StorageService.auth, StorageService.theme, StorageService.i18n, StorageService.onboarding]) {
    for (const k of store.getAllKeys()) {
      if (k in KEY_LABELS) {
        const label = KEY_LABELS[k] ?? k;
        const raw = store.getItem<unknown>(k);
        const value = raw == null ? '<empty>' : typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw);
        entries.push({ key: k, label, store: store.status.id, value });
      }
    }
  }
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

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

export function PreferencesScreen() {
  const [entries, setEntries] = React.useState<Entry[]>(() => readAllKeys());

  useFocusEffect(
    React.useCallback(() => {
      setEntries(readAllKeys());
    }, []),
  );

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        <View className="flex-row items-center justify-between">
          <Text variant="h4">Stored Preferences</Text>
        </View>

        <StoreStatusCards />

        {entries.length === 0 && (
          <Text variant="body" className="mt-4 text-center text-muted-foreground">No stored preferences found.</Text>
        )}

        <StorageEntriesList entries={entries} />

        <Button
          variant="destructive"
          onPress={() => {
            Alert.alert(
              'Clear All Storage',
              'This will remove all stored preferences including auth tokens, theme, language, and onboarding state. App will need to restart.',
              [
                { style: 'cancel', text: 'Cancel' },
                {
                  onPress: () => {
                    StorageService.auth.clearAll();
                    StorageService.theme.clearAll();
                    StorageService.i18n.clearAll();
                    StorageService.onboarding.clearAll();
                    setEntries([]);
                  },
                  style: 'destructive',
                  text: 'Clear',
                },
              ],
            );
          }}
          title="Clear All Storage"
          leftIcon={() => <Trash2 size={16} color="#fff" />}
          size="sm"
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
