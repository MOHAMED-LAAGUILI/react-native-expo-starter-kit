import type { BottomSheetOption } from '@/components/ui';
import type { ColorPaletteKey } from '@/config/color-palettes';
import type { ThemeMode } from '@/store';
import { Monitor, Moon, Sun } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { BottomSheet, Image } from '@/components/ui';

import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeColors } from '@/hooks/use-theme-color';
import { changeLanguage } from '@/i18n';
import { cn } from '@/utils/utils';

const LANGUAGE_OPTIONS: BottomSheetOption<string>[] = [
  { label: 'English', value: 'en', leftElement: <Image source={require('@assets/images/en-flag.png')} style={{ width: 24, height: 24, borderRadius: 12 }} /> },
  { label: 'Français', value: 'fr', leftElement: <Image source={require('@assets/images/fr-flag.png')} style={{ width: 24, height: 24, borderRadius: 12 }} /> },
];

type SettingsBottomSheetsProps = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  colorSheetOpen: boolean;
  setColorSheetOpen: (v: boolean) => void;
  themeSheetOpen: boolean;
  setThemeSheetOpen: (v: boolean) => void;
  langSheetOpen: boolean;
  setLangSheetOpen: (v: boolean) => void;
};

function SettingsBottomSheets({ mode, setMode, primaryColor, setPrimaryColor, colorSheetOpen, setColorSheetOpen, themeSheetOpen, setThemeSheetOpen, langSheetOpen, setLangSheetOpen }: SettingsBottomSheetsProps) {
  const { t, i18n } = useTranslation();
  const { text } = useThemeColors();
  const iconColor = text;

  const themeOptions: BottomSheetOption<ThemeMode>[] = [
    { label: t('theme.light'), leftElement: <Sun size={22} color={iconColor} />, value: 'light' },
    { label: t('theme.dark'), leftElement: <Moon size={22} color={iconColor} />, value: 'dark' },
    { label: t('theme.system'), leftElement: <Monitor size={22} color={iconColor} />, value: 'system' },
  ];

  const colorOptions: BottomSheetOption<ColorPaletteKey>[] = COLOR_PALETTES.map(p => ({
    label: p.label,
    leftElement: <View className={cn('size-6 rounded-full', primaryColor === p.key && 'ring-primary ring-2 ring-offset-2')} style={{ backgroundColor: p.color }} />,
    value: p.key,
  }));

  return (
    <>
      <BottomSheet
        open={colorSheetOpen}
        onOpenChange={setColorSheetOpen}
        title={t('settings.accentColorSheetTitle')}
        options={colorOptions}
        selectedValue={primaryColor}
        onSelect={(value) => {
          setPrimaryColor(value);
          setColorSheetOpen(false);
        }}
      />

      <BottomSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        title={t('theme.title')}
        options={themeOptions}
        selectedValue={mode}
        onSelect={(value) => {
          setMode(value);
          setThemeSheetOpen(false);
        }}
      />

      <BottomSheet
        open={langSheetOpen}
        onOpenChange={setLangSheetOpen}
        title={t('language.title')}
        options={LANGUAGE_OPTIONS}
        selectedValue={i18n.language}
        onSelect={(value) => {
          changeLanguage(value);
          setLangSheetOpen(false);
        }}
      />
    </>
  );
}

export { LANGUAGE_OPTIONS, SettingsBottomSheets };
