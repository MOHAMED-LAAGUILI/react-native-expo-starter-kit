import { useFocusEffect } from "expo-router";
import { Database, Trash2 } from "lucide-react-native";
import * as React from "react";
import { Alert, ScrollView, useWindowDimensions, View } from "react-native";
import { Button } from "@/components/ui";
import { Text } from "@/components/ui/Text";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";

const GRID_COLS = 2;

const KEY_LABELS: Record<string, string> = {
  [STORAGE_KEYS.AUTH_TOKEN]: "Auth Token",
  [STORAGE_KEYS.AUTH_REFRESH_TOKEN]: "Auth Refresh Token",
  [STORAGE_KEYS.AUTH_USER]: "Auth User",
  [STORAGE_KEYS.LANGUAGE]: "Language",
  [STORAGE_KEYS.ONBOARDING_COMPLETE]: "Onboarding Complete",
  [STORAGE_KEYS.PRIMARY_COLOR]: "Primary Color",
  [STORAGE_KEYS.THEME_MODE]: "Theme Mode",
};

interface Entry {
  key: string;
  label: string;
  value: string;
  store: string;
}

function readAllKeys(): Entry[] {
  const entries: Entry[] = [];
  for (const store of [StorageService.auth, StorageService.theme, StorageService.i18n, StorageService.onboarding]) {
    for (const k of store.getAllKeys()) {
      if (k in KEY_LABELS) {
        const label = KEY_LABELS[k] ?? k;
        const raw = store.getItem<unknown>(k);
        const value = raw == null ? "<empty>" : typeof raw === "object" ? JSON.stringify(raw, null, 2) : String(raw);
        entries.push({ key: k, label, store: store.status.id, value });
      }
    }
  }
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

export function PreferencesScreen() {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const stores = StorageService.getAllStores();
  const gap = 12;

  useFocusEffect(
    React.useCallback(() => {
      setEntries(readAllKeys());
    }, [])
  );

  const handleClear = React.useCallback(() => {
    Alert.alert(
      "Clear All Storage",
      "This will remove all stored preferences including auth tokens, theme, language, and onboarding state. App will need to restart.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            StorageService.auth.clearAll();
            StorageService.theme.clearAll();
            StorageService.i18n.clearAll();
            StorageService.onboarding.clearAll();
            setEntries([]);
          },
          style: "destructive",
          text: "Clear",
        },
      ]
    );
  }, []);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-6">
        <View className="flex-row items-center justify-between">
          <Text variant="h4">Stored Preferences</Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {stores.map((store, index) => {
            const statusColor = store.status.alive ? "#22c55e" : "#ef4444";
            return (
              <View
                key={store.id}
                className="p-3 rounded-xl border border-border bg-card gap-5 flex-wrap"
             >
                <View className="flex-row items-center gap-2 mb-1">
                  <Database
                    size={14}
                    color={statusColor}
                  />
                  <Text variant="caption">{store.id.replace("app-", "")}</Text>
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                </View>
                <View className="gap-0.5">
                  <Text
                    variant="caption"
                    className="text-muted-foreground text-[11px]"
                  >
                    Driver: {store.status.driver}
                  </Text>
                  <Text
                    variant="caption"
                    className="text-muted-foreground text-[11px]"
                  >
                    Alive: {store.status.alive ? "Yes" : "No"}
                  </Text>
                  <Text
                    variant="caption"
                    className="text-muted-foreground text-[11px]"
                  >
                    Keys: {store.status.keyCount}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {entries.length === 0 && (
          <Text
            variant="body"
            className="text-muted-foreground text-center mt-4"
          >
            No stored preferences found.
          </Text>
        )}

        <View className="gap-3">
          {entries.length > 0 && (
            <Text
              variant="label"
              className="text-muted-foreground uppercase tracking-wider text-xs"
            >
              Raw Storage
            </Text>
          )}
          {entries.map(entry => (
            <View
              key={entry.key}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  variant="caption"
                  className="text-muted-foreground"
                >
                  {entry.label}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text
                    variant="caption"
                    className="text-muted-foreground/50 text-[10px] font-mono"
                  >
                    {entry.store}
                  </Text>
                  <Text
                    variant="caption"
                    className="text-muted-foreground/50 text-[10px] font-mono"
                  >
                    {entry.key}
                  </Text>
                </View>
              </View>
              <Text
                variant="body"
                className="font-mono text-sm leading-5"
                selectable
              >
                {entry.value}
              </Text>
            </View>
          ))}
        </View>

        <Button
          variant="destructive"
          onPress={handleClear}
          title="Clear All Storage"
          leftIcon={
            <Trash2
              size={16}
              color="#fff"
            />
          }
          size="sm"
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
