import type { BottomSheetOption } from '@/components/ui/bottom-sheet';
import type { ColorPaletteKey } from '@/config/color-palettes';
import type { ThemeMode } from '@/store';
import { useNetInfo } from '@react-native-community/netinfo';
import { Brush, ExternalLink, Globe, Heart, Info, Monitor, Moon, Share2, Sun, Wifi } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, Share, View } from 'react-native';
import { SettingRow } from '@/components/common/setting-row';
import { Text } from '@/components/ui';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeColors } from '@/hooks/use-theme-color';
import { changeLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store';

const LANGUAGE_OPTIONS: BottomSheetOption<string>[] = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
];

function AppearanceSection({
  currentColorLabel,
  currentPalette,
  currentLangLabel,
  themeLabels,
  mode,
  onThemePress,
  onColorPress,
  onLangPress,
}: {
  currentColorLabel: string;
  currentPalette?: { color: string };
  currentLangLabel: string;
  themeLabels: Record<string, string>;
  mode: ThemeMode;
  onThemePress: () => void;
  onColorPress: () => void;
  onLangPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View>
      <Text variant="label" className="mb-3 tracking-wider text-muted-foreground uppercase">{t('settings.appearance')}</Text>
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        <SettingRow
          icon={mode === 'dark' ? Moon : mode === 'system' ? Monitor : Sun}
          label={t('settings.theme')}
          subtitle={themeLabels[mode]}
          onPress={onThemePress}
        />
        <View className="mx-4 h-px bg-border" />
        <SettingRow
          icon={Brush}
          label={t('settings.accentColor')}
          subtitle={currentColorLabel}
          rightElement={<View className="mr-2 size-5 rounded-full" style={{ backgroundColor: currentPalette?.color }} />}
          onPress={onColorPress}
        />
        <View className="mx-4 h-px bg-border" />
        <SettingRow
          icon={Globe}
          label={t('settings.language')}
          subtitle={currentLangLabel}
          onPress={onLangPress}
        />
      </View>
    </View>
  );
}

function AppInfoSection() {
  const { t } = useTranslation();
  const { type, isConnected } = useNetInfo();
  const { icon } = useThemeColors();

  return (
    <View>
      <Text variant="label" className="mb-3 tracking-wider text-muted-foreground uppercase">{t('settings.info')}</Text>
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        <View className="flex-row items-center p-4">
          <Info size={22} color={icon} style={{ marginRight: 12 }} />
          <View className="flex-1">
            <Text variant="body">{t('app.name')}</Text>
            <Text variant="caption" className="mt-0.5 text-muted-foreground">{t('app.version', { version: '1.0.0' })}</Text>
            <Text variant="caption" className="text-muted-foreground">{t('app.description')}</Text>
          </View>
        </View>
        <View className="mx-4 h-px bg-border" />
        <SettingRow
          icon={Wifi}
          label={t('settings.network')}
          subtitle={
            isConnected == null
              ? t('settings.networkChecking')
              : isConnected
                ? t('settings.networkConnected', { type })
                : t('settings.networkDisconnected')
          }
          rightElement={(
            <View
              className={cn(
                'mr-2 size-3 rounded-full',
                isConnected == null && 'bg-muted-foreground',
                isConnected === true && 'bg-green-500',
                isConnected === false && 'bg-red-500',
              )}
            />
          )}
        />
      </View>
    </View>
  );
}

function SupportSection() {
  const { t } = useTranslation();

  return (
    <View>
      <Text variant="label" className="mb-3 tracking-wider text-muted-foreground uppercase">{t('settings.support')}</Text>
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        <SettingRow
          icon={Share2}
          label={t('settings.shareApp')}
          subtitle={t('settings.shareAppDescription')}
          onPress={() => Share.share({ message: t('settings.shareMessage'), url: 'https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit' })}
        />
        <View className="mx-4 h-px bg-border" />
        <SettingRow
          icon={Heart}
          label={t('settings.supportFeedback')}
          subtitle={t('settings.supportFeedbackDescription')}
          onPress={() => Linking.openURL('https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit/issues')}
        />
        <View className="mx-4 h-px bg-border" />
        <SettingRow
          icon={ExternalLink}
          label={t('settings.developer')}
          subtitle={t('settings.developerDescription')}
          onPress={() => Linking.openURL('https://github.com/MOHAMED-LAAGUILI')}
        />
      </View>
    </View>
  );
}

type SheeterProps = { mode: ThemeMode; setMode: (m: ThemeMode) => void; primaryColor: string; setPrimaryColor: (c: string) => void; colorSheetOpen: boolean; setColorSheetOpen: (v: boolean) => void; themeSheetOpen: boolean; setThemeSheetOpen: (v: boolean) => void; langSheetOpen: boolean; setLangSheetOpen: (v: boolean) => void };

function SettingsBottomSheets({ mode, setMode, primaryColor, setPrimaryColor, colorSheetOpen, setColorSheetOpen, themeSheetOpen, setThemeSheetOpen, langSheetOpen, setLangSheetOpen }: SheeterProps) {
  const { t, i18n } = useTranslation();
  const { text } = useThemeColors();
  const iconColor = text;

  const themeOptions = React.useMemo<BottomSheetOption<ThemeMode>[]>(
    () => [
      { label: t('theme.light'), leftElement: <Sun size={22} color={iconColor} />, value: 'light' },
      { label: t('theme.dark'), leftElement: <Moon size={22} color={iconColor} />, value: 'dark' },
      { label: t('theme.system'), leftElement: <Monitor size={22} color={iconColor} />, value: 'system' },
    ],
    [t, iconColor],
  );

  const colorOptions = React.useMemo<BottomSheetOption<ColorPaletteKey>[]>(
    () => COLOR_PALETTES.map(p => ({
      label: p.label,
      leftElement: <View className={cn('size-6 rounded-full', primaryColor === p.key && 'ring-2 ring-primary ring-offset-2')} style={{ backgroundColor: p.color }} />,
      value: p.key,
    })),
    [primaryColor],
  );

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
