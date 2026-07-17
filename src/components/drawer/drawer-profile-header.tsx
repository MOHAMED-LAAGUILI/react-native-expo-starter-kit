import { Image } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/utils';
import { Text } from '../ui';

export function DrawerProfileHeader() {
  const user = useAuthStore(s => s.user);
  const primaryHex = usePrimaryHex();
  const { top: safeTop } = useSafeAreaInsets();

  return (
    <View
      className="relative -mx-4 mb-2"
      style={{ height: 140 + safeTop }}
    >
      <Svg
        height="100%"
        width="100%"
        viewBox="0 0 300 140"
        preserveAspectRatio="none"
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient
            id="drawerGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={primaryHex} />
            <Stop offset="100%" stopColor={primaryHex} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#drawerGrad)" />
      </Svg>

      <View
        className="absolute inset-x-0 flex-row items-center px-4"
        style={{ bottom: 0, top: safeTop }}
      >
        <View className={cn('overflow-hidden rounded-full border-2 border-white/30', 'size-17')}>
          <Image
            source={require('@assets/images/react-logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>

        <View className="ml-4 flex-1">
          <Text variant="h4" className="text-white">
            {user?.name ?? 'James Martin'}
          </Text>
          <Text variant="bodySmall" className="mt-0.5 text-white/80">
            Senior Graphic Designer
          </Text>
        </View>
      </View>
    </View>
  );
}
