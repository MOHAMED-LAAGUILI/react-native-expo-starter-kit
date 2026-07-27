import type { Permission, PermissionStatus } from 'react-native-permissions';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { check, checkNotifications, openSettings, PERMISSIONS, request, requestNotifications, RESULTS } from 'react-native-permissions';

export type PermissionLabel = 'Notifications' | 'Camera' | 'Location' | 'Microphone';

export const PERMISSION_LABELS: PermissionLabel[] = ['Notifications', 'Camera', 'Location', 'Microphone'];

type PermConfig = {
  permission: Permission | null;
  isNotification: boolean;
};

const PERM_CONFIGS: Record<PermissionLabel, PermConfig> = {
  Notifications: { permission: null, isNotification: true },
  Camera: {
    permission: Platform.select({ ios: PERMISSIONS.IOS.CAMERA, android: PERMISSIONS.ANDROID.CAMERA }) ?? null,
    isNotification: false,
  },
  Location: {
    permission: Platform.select({ ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION }) ?? null,
    isNotification: false,
  },
  Microphone: {
    permission: Platform.select({ ios: PERMISSIONS.IOS.MICROPHONE, android: PERMISSIONS.ANDROID.RECORD_AUDIO }) ?? null,
    isNotification: false,
  },
};

export type PermStatusMap = Record<string, PermissionStatus | null>;

/** Returns the status for every permission label (no side effects). */
export async function checkAllPermissions(): Promise<PermStatusMap> {
  const entries = await Promise.all(
    PERMISSION_LABELS.map(async (label) => {
      const cfg = PERM_CONFIGS[label];
      if (cfg.isNotification) {
        const r = await checkNotifications();
        return [label, r.status] as const;
      }
      if (cfg.permission) {
        const status = await check(cfg.permission);
        return [label, status] as const;
      }
      return [label, RESULTS.UNAVAILABLE] as const;
    }),
  );
  return Object.fromEntries(entries) as PermStatusMap;
}

export function usePermissionsStatus() {
  const [statuses, setStatuses] = useState<PermStatusMap>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAllPermissions().then(setStatuses);
  }, []);

  const requestPermission = useCallback(async (label: PermissionLabel) => {
    setLoading(prev => ({ ...prev, [label]: true }));
    try {
      const cfg = PERM_CONFIGS[label];
      if (cfg.isNotification) {
        const r = await requestNotifications(['alert', 'sound', 'badge']);
        setStatuses(prev => ({ ...prev, [label]: r.status }));
      }
      else if (cfg.permission) {
        const s = await request(cfg.permission);
        setStatuses(prev => ({ ...prev, [label]: s }));
        if (s === RESULTS.BLOCKED)
          await openSettings('application');
      }
    }
    catch { /* fail */ }
    setLoading(prev => ({ ...prev, [label]: false }));
  }, []);

  return {
    statuses,
    loading,
    requestPermission,
    isGranted: (label: PermissionLabel) => {
      const s = statuses[label];
      return s === RESULTS.GRANTED || s === RESULTS.LIMITED;
    },
    configs: PERM_CONFIGS,
  };
}
