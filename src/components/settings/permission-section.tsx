import type { PermissionLabel } from '@/hooks/use-permissions-status';
import { Bell, Camera, MapPin, Mic } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { openSettings, RESULTS } from 'react-native-permissions';
import { SectionHeader } from '@/components/common/section-header';
import { SettingGroup } from '@/components/common/setting-group';
import { SettingRow } from '@/components/common/setting-row';
import { Badge, Switch } from '@/components/ui';
import { usePermissionsStatus } from '@/hooks/use-permissions-status';

const ICONS: Record<PermissionLabel, React.ComponentType<{ size?: number; color?: string }>> = {
  Notifications: Bell,
  Camera,
  Location: MapPin,
  Microphone: Mic,
};

const PERMISSION_LABELS_STATIC: PermissionLabel[] = ['Notifications', 'Camera', 'Location', 'Microphone'];

function getBadgeVariant(status: string | null): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED: return 'default';
    case RESULTS.DENIED: return 'secondary';
    case RESULTS.BLOCKED: return 'destructive';
    default: return 'outline';
  }
}

function getStatusLabel(t: (key: string) => string, status: string | null): string {
  switch (status) {
    case RESULTS.GRANTED: return t('granted');
    case RESULTS.DENIED: return t('denied');
    case RESULTS.BLOCKED: return t('blocked');
    case RESULTS.UNAVAILABLE: return t('unavailable');
    case RESULTS.LIMITED: return t('limited');
    default: return t('checking');
  }
}

function PermissionSection() {
  const { t } = useTranslation('settings');
  const { statuses, loading, requestPermission, isGranted } = usePermissionsStatus();

  const handleToggle = async (label: PermissionLabel) => {
    if (!isGranted(label)) {
      await requestPermission(label);
      return;
    }
    await openSettings('application');
  };

  return (
    <View>
      <SectionHeader label={t('appPermissions')} />
      <SettingGroup>
        {PERMISSION_LABELS_STATIC.map((label) => {
          const status = statuses[label] ?? null;
          const granted = isGranted(label);
          const disabled = status === RESULTS.BLOCKED || status === RESULTS.UNAVAILABLE;
          const Icon = ICONS[label];

          return (
            <SettingRow
              key={label}
              icon={Icon}
              label={t(label.toLowerCase())}
              rightElement={(
                <View className="flex-row items-center gap-2">
                  <Badge variant={getBadgeVariant(status)} size="sm">
                    {getStatusLabel(t, status)}
                  </Badge>
                  <Switch
                    checked={granted}
                    disabled={disabled || loading[label]}
                    onCheckedChange={() => handleToggle(label)}
                  />
                </View>
              )}
            />
          );
        })}
      </SettingGroup>
    </View>
  );
}

export { PermissionSection };
