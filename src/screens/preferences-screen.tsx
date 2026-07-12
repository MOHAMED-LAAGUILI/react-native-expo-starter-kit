import type { Entry } from '@/data/preferences-info';
import { useFocusEffect } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { StorageEntriesList, StoreStatusCards } from '@/components/preferences';
import { Button, Text } from '@/components/ui';
import { KEY_LABELS } from '@/data/preferences-info';
import { StorageService } from '@/storage';

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
