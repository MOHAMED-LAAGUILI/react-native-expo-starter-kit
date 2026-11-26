import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

/**
 * Permission status for Notifications / Camera / Location / Microphone, built
 * on each Expo module's own permission API — no extra native module, so it
 * works in Expo Go as well as in dev and store builds.
 *
 * Expo reports `granted | denied | undetermined` plus `canAskAgain`; we map
 * that onto the familiar result names so callers stay simple.
 */
export const RESULTS = {
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  GRANTED: 'granted',
  LIMITED: 'limited',
} as const;

export type PermissionStatus = (typeof RESULTS)[keyof typeof RESULTS];

export type PermissionLabel = 'Notifications' | 'Camera' | 'Location' | 'Microphone';

export const PERMISSION_LABELS: PermissionLabel[] = ['Notifications', 'Camera', 'Location', 'Microphone'];

type ExpoPermission = { status: string; canAskAgain?: boolean; granted?: boolean };
type PermissionApi = { get: () => Promise<ExpoPermission>; request: () => Promise<ExpoPermission> };

/** Modules are imported lazily: nothing native loads until a permission is checked. */
const PERMISSION_APIS: Record<PermissionLabel, () => Promise<PermissionApi>> = {
  Notifications: async () => {
    const Notifications = await import('expo-notifications');
    return { get: () => Notifications.getPermissionsAsync(), request: () => Notifications.requestPermissionsAsync() };
  },
  Camera: async () => {
    const { Camera } = await import('expo-camera');
    return { get: () => Camera.getCameraPermissionsAsync(), request: () => Camera.requestCameraPermissionsAsync() };
  },
  Microphone: async () => {
    const { Camera } = await import('expo-camera');
    return { get: () => Camera.getMicrophonePermissionsAsync(), request: () => Camera.requestMicrophonePermissionsAsync() };
  },
  Location: async () => {
    const Location = await import('expo-location');
    return { get: () => Location.getForegroundPermissionsAsync(), request: () => Location.requestForegroundPermissionsAsync() };
  },
};

function toStatus(response: ExpoPermission): PermissionStatus {
  if (response.granted || response.status === 'granted')
    return RESULTS.GRANTED;
  if (response.status === 'denied' && response.canAskAgain === false)
    return RESULTS.BLOCKED;
  return RESULTS.DENIED;
}

async function statusOf(label: PermissionLabel, ask: boolean): Promise<PermissionStatus> {
  try {
    const api = await PERMISSION_APIS[label]();
    return toStatus(await (ask ? api.request() : api.get()));
  }
  catch {
    return RESULTS.UNAVAILABLE; // module unavailable on this platform (e.g. web)
  }
}

/** Opens this app's page in the system settings. */
export function openSettings(): Promise<void> {
  return Linking.openSettings();
}

export type PermStatusMap = Record<string, PermissionStatus | null>;

/** Returns the status for every permission label (no side effects). */
export async function checkAllPermissions(): Promise<PermStatusMap> {
  const entries = await Promise.all(PERMISSION_LABELS.map(async label => [label, await statusOf(label, false)] as const));
  return Object.fromEntries(entries) as PermStatusMap;
}

export function usePermissionsStatus() {
  const [statuses, setStatuses] = useState<PermStatusMap>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const refresh = () => {
    checkAllPermissions().then(setStatuses);
  };

  useEffect(() => {
    checkAllPermissions().then(setStatuses);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active')
        checkAllPermissions().then(setStatuses);
    });
    return () => subscription.remove();
  }, []);

  const requestPermission = async (label: PermissionLabel) => {
    setLoading(prev => ({ ...prev, [label]: true }));
    const status = await statusOf(label, true);
    setStatuses(prev => ({ ...prev, [label]: status }));
    if (status === RESULTS.BLOCKED)
      await openSettings().catch(() => {});
    setLoading(prev => ({ ...prev, [label]: false }));
  };

  return {
    statuses,
    loading,
    requestPermission,
    refresh,
    isGranted: (label: PermissionLabel) => {
      const s = statuses[label];
      return s === RESULTS.GRANTED || s === RESULTS.LIMITED;
    },
  };
}
