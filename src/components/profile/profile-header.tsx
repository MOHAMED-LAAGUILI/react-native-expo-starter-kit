import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text } from '@/components/ui';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/utils';

type ProfileHeaderProps = {
  gradientColor: string;
  name: string;
};

function ProfileHeader({ gradientColor: _gradientColor, name: _name }: ProfileHeaderProps) {
  const user = useAuthStore(s => s.user);
  const insets = useSafeAreaInsets();

  return (
    <View className="relative -mx-4 mb-2">
      <View className="absolute inset-0 bg-primary" />

      <View
        className="flex-row items-center px-6"
        style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}
      >
        <View
          className={cn(
            'overflow-hidden rounded-full border-2 border-white/30',
            'size-16',
          )}
        >
          <Image
            source={require('@assets/images/react-logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>

        <View className="ml-4 flex-1 justify-center">
          <Text variant="h4" className="text-white">
            {user?.name ?? 'James Martin'}
          </Text>
          <Text variant="bodySmall" className="mt-1 text-white/80">
            {user?.role ?? 'Administrator'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export { ProfileHeader };
export type { ProfileHeaderProps };
