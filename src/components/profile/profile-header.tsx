import { BadgeCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/utils';

function ProfileHeader() {
  const user = useAuthStore(s => s.user);
  const primaryHex = usePrimaryHex();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 25, paddingBottom: 32 }}>
      <View className="items-center">
        <View className="relative items-center justify-center">
          <View
            className="absolute size-28 rounded-full"
            style={{
              backgroundColor: `${primaryHex}20`,
              boxShadow: `0 0 18px ${primaryHex}80`,
            }}
          />

          <View
            className={cn(
              'overflow-hidden rounded-full border-2',
              'size-24',
            )}
            style={{
              borderColor: primaryHex,
              boxShadow: `0 0 12px ${primaryHex}B3`,
            }}
          >
            <Image
              source={require('@assets/images/react-logo.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
        </View>

        <View className="mt-4 items-center">
          <Text variant="h3" className="text-foreground">
            {user?.name ?? 'James Martin'}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Text variant="body" className="text-muted-foreground">
              {user?.role ?? 'Administrator'}
            </Text>
            <BadgeCheck size={14} color="#a1a1aa" />
          </View>
        </View>
      </View>
    </View>
  );
}

export { ProfileHeader };
