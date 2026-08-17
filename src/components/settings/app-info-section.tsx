import { useNetInfo } from '@react-native-community/netinfo';
import { Info, Wifi } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SectionHeader } from '@/components/common/section-header';
import { SettingGroup } from '@/components/common/setting-group';
import { SettingRow } from '@/components/common/setting-row';
import { Text } from '@/components/ui';
import { ENV } from '@/config/env';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';

function AppInfoSection() {
  const { t: tSettings } = useTranslation('settings');
  const { t } = useTranslation();
  const { type, isConnected } = useNetInfo();
  const { icon } = useThemeColors();

  return (
    <View>
      <SectionHeader label={tSettings('info')} />
      <SettingGroup>
        <View className="flex-row items-center p-4">
          <Info size={22} color={icon} style={{ marginRight: 12 }} />
          <View className="flex-1">
            <Text variant="body">{ENV.EXPO_PUBLIC_NAME}</Text>
            <Text variant="caption" className="text-muted-foreground mt-0.5">{t('app.version', { version: ENV.EXPO_PUBLIC_VERSION })}</Text>
          </View>
        </View>
        <SettingRow
          icon={Wifi}
          label={tSettings('network')}
          subtitle={
            isConnected == null
              ? tSettings('networkChecking')
              : isConnected
                ? tSettings('networkConnected', { type })
                : tSettings('networkDisconnected')
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
      </SettingGroup>
    </View>
  );
}

export { AppInfoSection };
