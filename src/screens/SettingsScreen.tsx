import { useNetInfo } from "@react-native-community/netinfo";
import { Brush, ExternalLink, Globe, Heart, Info, Palette, Share2, Wifi } from "lucide-react-native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, Share, View } from "react-native";
import { SettingRow } from "@/components/common/SettingRow";
import { BottomSheet, type BottomSheetOption } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { COLOR_PALETTES, type ColorPaletteKey } from "@/config/color-palettes";
import { useThemeColors } from "@/hooks/useThemeColor";
import { changeLanguage } from "@/i18n";
import { cn } from "@/lib/utils";
import { type ThemeMode, useThemeStore } from "@/store";

const THEME_OPTIONS: BottomSheetOption<ThemeMode>[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const LANGUAGE_OPTIONS: BottomSheetOption<string>[] = [
  { label: "English", value: "en" },
  { label: "Français", value: "fr" },
];

function SettingsScreen() {
  const { mode, setMode, primaryColor, setPrimaryColor } = useThemeStore();
  const { t, i18n } = useTranslation();
  const { type, isConnected } = useNetInfo();
  const { text } = useThemeColors();
  const [themeSheetOpen, setThemeSheetOpen] = React.useState(false);
  const [langSheetOpen, setLangSheetOpen] = React.useState(false);
  const [colorSheetOpen, setColorSheetOpen] = React.useState(false);

  const currentThemeLabel = THEME_OPTIONS.find(o => o.value === mode)?.label ?? "System";
  const currentLangLabel = LANGUAGE_OPTIONS.find(o => o.value === i18n.language)?.label ?? "English";
  const currentPalette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const currentColorLabel = currentPalette?.label ?? "Blue";

  const colorOptions = React.useMemo<BottomSheetOption<ColorPaletteKey>[]>(
    () =>
      COLOR_PALETTES.map(p => ({
        label: p.label,
        leftElement: (
          <View
            className={cn("w-6 h-6 rounded-full mr-3", primaryColor === p.key && "ring-2 ring-offset-2 ring-primary")}
            style={{ backgroundColor: p.color }}
          />
        ),
        value: p.key,
      })),
    [primaryColor]
  );

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-8">
          <View>
            <Text
              variant="label"
              className="text-muted-foreground uppercase tracking-wider mb-3"
            >
              {t("settings.appearance")}
            </Text>
            <View className="rounded-xl border border-border bg-card overflow-hidden">
              <SettingRow
                icon={Brush}
                label="Accent Color"
                subtitle={currentColorLabel}
                rightElement={
                  <View
                    className="w-5 h-5 rounded-full mr-2"
                    style={{ backgroundColor: currentPalette?.color }}
                  />
                }
                onPress={() => setColorSheetOpen(true)}
              />
              <View className="h-px bg-border mx-4" />
              <SettingRow
                icon={Palette}
                label={t("theme.title")}
                subtitle={currentThemeLabel}
                onPress={() => setThemeSheetOpen(true)}
              />
              <View className="h-px bg-border mx-4" />
              <SettingRow
                icon={Globe}
                label={t("language.title")}
                subtitle={currentLangLabel}
                onPress={() => setLangSheetOpen(true)}
              />
            </View>
          </View>

          <View>
            <Text
              variant="label"
              className="text-muted-foreground uppercase tracking-wider mb-3"
            >
              {t("settings.info")}
            </Text>
            <View className="rounded-xl border border-border bg-card overflow-hidden">
              <View className="flex-row items-center p-4">
                <Info
                  size={22}
                  color={text}
                  style={{ marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text variant="body">{t("app.name")}</Text>
                  <Text
                    variant="caption"
                    className="text-muted-foreground mt-0.5"
                  >
                    {t("app.version", { version: "1.0.0" })}
                  </Text>

                  <Text
                    variant="caption"
                    className="text-muted-foreground"
                  >
                    {t("app.description")}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-border mx-4" />
              <SettingRow
                icon={Wifi}
                label={t("settings.network")}
                subtitle={
                  isConnected == null
                    ? t("settings.networkChecking")
                    : isConnected
                      ? t("settings.networkConnected", { type })
                      : t("settings.networkDisconnected")
                }
                rightElement={
                  <View
                    className={cn(
                      "w-3 h-3 rounded-full mr-2",
                      isConnected == null && "bg-muted-foreground",
                      isConnected === true && "bg-green-500",
                      isConnected === false && "bg-red-500"
                    )}
                  />
                }
              />
            </View>
          </View>

          <View>
            <Text
              variant="label"
              className="text-muted-foreground uppercase tracking-wider mb-3"
            >
              Support
            </Text>
            <View className="rounded-xl border border-border bg-card overflow-hidden">
              <SettingRow
                icon={Share2}
                label="Share App"
                subtitle="Tell others about this app"
                onPress={() => {
                  Share.share({
                    message: "Check out this app!",
                    url: "https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit",
                  });
                }}
              />
              <View className="h-px bg-border mx-4" />
              <SettingRow
                icon={Heart}
                label="Support & Feedback"
                subtitle="Open a GitHub issue"
                onPress={() => Linking.openURL("https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit/issues")}
              />
              <View className="h-px bg-border mx-4" />
              <SettingRow
                icon={ExternalLink}
                label="Developer"
                subtitle="View portfolio"
                onPress={() => Linking.openURL("https://github.com/MOHAMED-LAAGUILI")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        open={colorSheetOpen}
        onOpenChange={setColorSheetOpen}
        title="Accent Color"
        options={colorOptions}
        selectedValue={primaryColor}
        onSelect={value => setPrimaryColor(value)}
      />

      <BottomSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        title={t("theme.title")}
        options={THEME_OPTIONS}
        selectedValue={mode}
        onSelect={value => setMode(value)}
      />

      <BottomSheet
        open={langSheetOpen}
        onOpenChange={setLangSheetOpen}
        title={t("language.title")}
        options={LANGUAGE_OPTIONS}
        selectedValue={i18n.language}
        onSelect={value => changeLanguage(value)}
      />
    </>
  );
}

export { SettingsScreen };
