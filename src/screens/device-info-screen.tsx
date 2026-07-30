import * as Device from 'expo-device';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';

type DeviceInfoRow = {
  label: string;
  value: string;
};

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function deviceTypeLabel(type: Device.DeviceType | null): string {
  if (type == null)
    return '—';
  const labels: Record<number, string> = {
    [Device.DeviceType.UNKNOWN]: 'Unknown',
    [Device.DeviceType.PHONE]: 'Phone',
    [Device.DeviceType.TABLET]: 'Tablet',
    [Device.DeviceType.TV]: 'TV',
    [Device.DeviceType.DESKTOP]: 'Desktop',
  };
  return labels[type] ?? `Unknown (${type})`;
}

function buildStaticInfo(): DeviceInfoRow[] {
  const raw: DeviceInfoRow[] = [
    { label: 'Is Device', value: Device.isDevice ? 'Yes (physical)' : 'No (emulator)' },
    { label: 'Brand', value: Device.brand ?? '—' },
    { label: 'Manufacturer', value: Device.manufacturer ?? '—' },
    { label: 'Model Name', value: Device.modelName ?? '—' },
    { label: 'Model ID', value: Device.modelId ?? '—' },
    { label: 'Design Name', value: Device.designName ?? '—' },
    { label: 'Product Name', value: Device.productName ?? '—' },
    { label: 'Device Name', value: Device.deviceName ?? '—' },
    { label: 'Device Year Class', value: Device.deviceYearClass != null ? String(Device.deviceYearClass) : '—' },
    { label: 'OS Name', value: Device.osName ?? '—' },
    { label: 'OS Version', value: Device.osVersion ?? '—' },
    { label: 'OS Build ID', value: Device.osBuildId ?? '—' },
    { label: 'OS Internal Build ID', value: Device.osInternalBuildId ?? '—' },
    { label: 'OS Build Fingerprint', value: Device.osBuildFingerprint ?? '—' },
    { label: 'Platform API Level', value: Device.platformApiLevel != null ? String(Device.platformApiLevel) : '—' },
    { label: 'Total Memory', value: Device.totalMemory != null ? formatBytes(Device.totalMemory) : '—' },
    { label: 'Supported CPU Architectures', value: Device.supportedCpuArchitectures?.join(', ') ?? '—' },
  ];
  return raw.filter(r => r.value !== '—');
}

function DeviceInfoScreen() {
  const [staticRows] = React.useState(() => buildStaticInfo());
  const [asyncRows, setAsyncRows] = React.useState<DeviceInfoRow[]>([]);

  React.useEffect(() => {
    const loadAsync = async () => {
      const items: DeviceInfoRow[] = [];

      try {
        const dtype = await Device.getDeviceTypeAsync();
        items.push({ label: 'Device Type', value: deviceTypeLabel(dtype) });
      }
      catch {}

      try {
        const uptime = await Device.getUptimeAsync();
        items.push({ label: 'Uptime', value: `${(uptime / 1000).toFixed(0)}s` });
      }
      catch {}

      try {
        const maxMem = await Device.getMaxMemoryAsync();
        if (maxMem !== Number.MAX_SAFE_INTEGER) {
          items.push({ label: 'Max Memory', value: formatBytes(maxMem) });
        }
      }
      catch {}

      try {
        const rooted = await Device.isRootedExperimentalAsync();
        items.push({ label: 'Rooted / Jailbroken', value: rooted ? 'Yes' : 'No' });
      }
      catch {}

      try {
        const sideload = await Device.isSideLoadingEnabledAsync();
        items.push({ label: 'Side Loading Enabled', value: sideload ? 'Yes' : 'No' });
      }
      catch {}

      try {
        const features = await Device.getPlatformFeaturesAsync();
        if (features.length > 0) {
          items.push({ label: 'Platform Features', value: features.slice(0, 10).join(', ') });
        }
      }
      catch {}

      setAsyncRows(items);
    };

    loadAsync();
  }, []);

  const allRows = [...staticRows, ...asyncRows];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-6 pb-12">
        <View className="border-border bg-card overflow-hidden rounded-xl border">
          {allRows.map((row, index) => (
            <View key={row.label}>
              {index > 0 && <View className="bg-border mx-4 h-px" />}
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text variant="body" className="text-muted-foreground shrink">{row.label}</Text>
                <Text variant="body" className="ml-2 flex-1 text-right font-medium">{row.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export { DeviceInfoScreen };
