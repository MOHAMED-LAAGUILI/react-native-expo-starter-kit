import type { ThemeMode } from '@/store';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppearanceSection, AppInfoSection, LANGUAGE_OPTIONS, SettingsBottomSheets, SupportSection } from '@/components/settings';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeStore } from '@/store';

function SettingsScreen() {
  const { mode, setMode, primaryColor, setPrimaryColor } = useThemeStore();
  const { t, i18n } = useTranslation();
  const [langSheetOpen, setLangSheetOpen] = React.useState(false);
  const [colorSheetOpen, setColorSheetOpen] = React.useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = React.useState(false);

  const currentLangLabel = LANGUAGE_OPTIONS.find(o => o.value === i18n.language)?.label ?? 'English';
  const currentPalette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const currentColorLabel = currentPalette?.label ?? 'Blue';
  const themeLabels: Record<ThemeMode, string> = { dark: t('theme.dark'), light: t('theme.light'), system: t('theme.system') };

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        <View className="gap-8 p-6">
          <AppearanceSection
            currentColorLabel={currentColorLabel}
            currentPalette={currentPalette}
            currentLangLabel={currentLangLabel}
            themeLabels={themeLabels}
            mode={mode}
            onThemePress={() => setThemeSheetOpen(true)}
            onColorPress={() => setColorSheetOpen(true)}
            onLangPress={() => setLangSheetOpen(true)}
          />
          <AppInfoSection />
          <SupportSection />
        </View>
      </ScrollView>

      <SettingsBottomSheets
        mode={mode}
        setMode={setMode}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
        colorSheetOpen={colorSheetOpen}
        setColorSheetOpen={setColorSheetOpen}
        themeSheetOpen={themeSheetOpen}
        setThemeSheetOpen={setThemeSheetOpen}
        langSheetOpen={langSheetOpen}
        setLangSheetOpen={setLangSheetOpen}
      />
    </>
  );
}

export { SettingsScreen };
