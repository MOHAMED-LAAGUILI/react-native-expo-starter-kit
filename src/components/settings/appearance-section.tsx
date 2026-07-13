import type { ThemeMode } from '@/store';
import { Brush, Globe, Monitor, Moon, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SettingRow } from '@/components/common/setting-row';
import { Text } from '@/components/ui';

function AppearanceSection({
  currentColorLabel,
  currentPalette,
  currentLangLabel,
  currentLangFlag,
  themeLabels,
  mode,
  onThemePress,
  onColorPress,
  onLangPress,
}: {
  currentColorLabel: string;
  currentPalette?: { color: string };
  currentLangLabel: string;
  currentLangFlag?: React.ReactNode;
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
          rightElement={currentLangFlag}
          onPress={onLangPress}
        />
      </View>
    </View>
  );
}

export { AppearanceSection };
