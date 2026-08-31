import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import RNRestart from 'react-native-restart-newarch'; // Import package from node modules
import { Badge, Button, Image, Text } from '@/components/ui';
import { usePermissionsStatus } from '@/hooks/use-permissions-status';
import { loadExpoImagePicker, loadExpoLocation, loadExpoMediaLibrary, loadExpoNotifications } from '@/utils/permission-utils';
import { isWeb } from '@/utils/platform';

type PermissionsController = ReturnType<typeof usePermissionsStatus>;

type PermissionGateProps = {
  buttonTitle: string;
  children: ReactNode;
  granted: boolean;
  onRequest: () => void;
  requesting: boolean;
  status: string | null;
};

function PermissionGate({ buttonTitle, children, granted, onRequest, requesting, status }: PermissionGateProps) {
  if (status == null) {
    return <Button title="Checking…" size="sm" disabled />;
  }

  if (!granted) {
    return (
      <Button
        title={buttonTitle}
        onPress={onRequest}
        size="sm"
        variant="secondary"
        loading={requesting}
      />
    );
  }

  return <>{children}</>;
}

async function ensureNotificationHandler() {
  const mod = await loadExpoNotifications();
  await mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function handleUse() {
  try {
    const { AndroidImportance, requestPermissionsAsync, scheduleNotificationAsync, setNotificationChannelAsync } = await loadExpoNotifications();
    const { status: s } = await requestPermissionsAsync();
    if (s !== 'granted') {
      Alert.alert('Notifications', 'Permission not granted');
      return;
    }
    await ensureNotificationHandler();
    await setNotificationChannelAsync('default', { name: 'Default Channel', importance: AndroidImportance.DEFAULT });
    await scheduleNotificationAsync({
      content: { title: 'Test Notification', body: 'Triggered from home screen' },
      trigger: null,
    });
  }
  catch (e) { Alert.alert('Notifications', `Failed to show notification ${e}`); }
}

function NotificationCard({ permissions }: { permissions: PermissionsController }) {
  const { isGranted, loading, requestPermission, statuses } = permissions;
  const status = statuses.Notifications;
  const granted = isGranted('Notifications');

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 font-semibold">Notifications</Text>
        <Badge variant={granted ? 'default' : 'outline'} size="sm">{granted ? 'Granted' : 'Not Granted'}</Badge>
      </View>
      <Text variant="caption" className="text-muted-foreground">Send a test push notification</Text>
      <PermissionGate
        buttonTitle="Grant Notification Permission"
        granted={granted}
        onRequest={() => requestPermission('Notifications')}
        requesting={loading.Notifications}
        status={status}
      >
        <Button title="Show Notification" onPress={handleUse} size="sm" />
      </PermissionGate>
    </View>
  );
}

function CameraCard({ permissions }: { permissions: PermissionsController }) {
  const { isGranted, loading, requestPermission, statuses } = permissions;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const status = statuses.Camera;
  const granted = isGranted('Camera');

  async function handleUse() {
    try {
      const picker = await loadExpoImagePicker();
      const { status: s } = await picker.requestCameraPermissionsAsync();
      if (s !== 'granted') {
        Alert.alert('Camera', 'Camera permission is required');
        return;
      }
      const result = await picker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const lib = await loadExpoMediaLibrary();
        const { status: mlStatus } = await lib.requestPermissionsAsync(true);
        if (mlStatus !== 'granted') {
          Alert.alert('Camera', 'Media library permission is required to save photos');
          return;
        }
        const asset = await lib.Asset.create(result.assets[0].uri);
        setPhotoUri(await asset.getUri());
      }
    }
    catch { Alert.alert('Camera', 'Could not open camera'); }
  }

  if (isWeb) {
    return (
      <View className="gap-2 rounded-xl border border-border bg-card p-4">
        <Text className="font-semibold">Camera</Text>
        <Text variant="caption" className="text-muted-foreground">Not available on web</Text>
      </View>
    );
  }

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 font-semibold">Camera</Text>
        <Badge variant={granted ? 'default' : 'outline'} size="sm">{granted ? 'Granted' : 'Not Granted'}</Badge>
      </View>
      {photoUri
        ? (
            <>
              <Image source={{ uri: photoUri }} className="h-40 w-full rounded-lg" />
              <Button title="Take Another" onPress={() => setPhotoUri(null)} size="sm" variant="outline" />
            </>
          )
        : (
            <>
              <Text variant="caption" className="text-muted-foreground">Take a photo with the built-in camera</Text>
              <PermissionGate
                buttonTitle="Grant Camera Permission"
                granted={granted}
                onRequest={() => requestPermission('Camera')}
                requesting={loading.Camera}
                status={status}
              >
                <Button title="Open Camera" onPress={handleUse} size="sm" />
              </PermissionGate>
            </>
          )}
    </View>
  );
}

function LocationCard({ permissions }: { permissions: PermissionsController }) {
  const { isGranted, loading, requestPermission, statuses } = permissions;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const status = statuses.Location;
  const granted = isGranted('Location');

  async function handleUse() {
    try {
      const loc = await loadExpoLocation();
      const { status: s } = await loc.requestForegroundPermissionsAsync();
      if (s !== 'granted') {
        Alert.alert('Location', 'Permission denied');
        return;
      }
      const pos = await loc.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }
    catch { Alert.alert('Location', 'Could not get location'); }
  }

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 font-semibold">Location</Text>
        <Badge variant={granted ? 'default' : 'outline'} size="sm">{granted ? 'Granted' : 'Not Granted'}</Badge>
      </View>
      {coords
        ? (
            <>
              <Text variant="body">
                Lat:
                {coords.lat.toFixed(4)}
              </Text>
              <Text variant="body">
                Lng:
                {coords.lng.toFixed(4)}
              </Text>
              <Button title="Refresh" onPress={handleUse} size="sm" variant="outline" />
            </>
          )
        : (
            <>
              <Text variant="caption" className="text-muted-foreground">Get your current GPS coordinates</Text>
              <PermissionGate
                buttonTitle="Grant Location Permission"
                granted={granted}
                onRequest={() => requestPermission('Location')}
                requesting={loading.Location}
                status={status}
              >
                <Button title="Get Location" onPress={handleUse} size="sm" />
              </PermissionGate>
            </>
          )}
    </View>
  );
}

function PermissionCards() {
  // Single shared instance: one round of native permission checks and one
  // AppState listener for all three cards instead of one each.
  const permissions = usePermissionsStatus();

  return (
    <View className="gap-4">
      <Text variant="body" className="text-muted-foreground">Quick actions for notifications, camera, and location</Text>
      <NotificationCard permissions={permissions} />
      <CameraCard permissions={permissions} />
      <LocationCard permissions={permissions} />
      <Button title="Refresh" onPress={() => RNRestart.restart()} size="sm" />

    </View>
  );
}

export { PermissionCards };
