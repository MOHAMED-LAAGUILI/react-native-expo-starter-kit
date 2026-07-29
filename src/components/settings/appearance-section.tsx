import type { ThemeMode } from '@/store';
import { Brush, Globe, Monitor, Moon, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SectionHeader } from '@/components/common/section-header';
import { SettingGroup } from '@/components/common/setting-group';
import { SettingRow } from '@/components/common/setting-row';

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
  const { t } = useTranslation('settings');
  return (
    <View>
      <SectionHeader label={t('appearance')} />
      <SettingGroup>
        <SettingRow
          icon={mode === 'dark' ? Moon : mode === 'system' ? Monitor : Sun}
          label={t('theme')}
          subtitle={themeLabels[mode]}
          onPress={onThemePress}
        />
        <SettingRow
          icon={Brush}
          label={t('accentColor')}
          subtitle={currentColorLabel}
          rightElement={<View className="mr-2 size-5 rounded-full" style={{ backgroundColor: currentPalette?.color }} />}
          onPress={onColorPress}
        />
        <SettingRow
          icon={Globe}
          label={t('language')}
          subtitle={currentLangLabel}
          rightElement={currentLangFlag}
          onPress={onLangPress}
        />
      </SettingGroup>
    </View>
  );
}

export { AppearanceSection };
