import type { PermissionLabel } from '@/hooks/use-permissions-status';
import { Bell, Camera, MapPin } from 'lucide-react-native';
import { useCallback } from 'react';
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
};

const PERMISSION_LABELS_STATIC: PermissionLabel[] = ['Notifications', 'Camera', 'Location'];

function getStatusLabel(status: string | null): string {
  switch (status) {
    case RESULTS.GRANTED: return 'Granted';
    case RESULTS.DENIED: return 'Denied';
    case RESULTS.BLOCKED: return 'Blocked';
    case RESULTS.UNAVAILABLE: return 'Unavailable';
    case RESULTS.LIMITED: return 'Limited';
    default: return 'Checking…';
  }
}

function getBadgeVariant(status: string | null): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED: return 'default';
    case RESULTS.DENIED: return 'secondary';
    case RESULTS.BLOCKED: return 'destructive';
    default: return 'outline';
  }
}

function PermissionSection() {
  const { statuses, loading, requestPermission, isGranted } = usePermissionsStatus();

  const handleToggle = useCallback(async (label: PermissionLabel) => {
    if (!isGranted(label)) {
      await requestPermission(label);
      return;
    }
    await openSettings('application');
  }, [isGranted, requestPermission]);

  return (
    <View>
      <SectionHeader label="App Permissions" />
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
              label={label}
              rightElement={(
                <View className="flex-row items-center gap-2">
                  <Badge variant={getBadgeVariant(status)} size="sm">
                    {getStatusLabel(status)}
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
