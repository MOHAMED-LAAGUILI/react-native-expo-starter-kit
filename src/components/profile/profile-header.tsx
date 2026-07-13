import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '@/components/ui';
import { cn } from '@/utils/utils';

type ProfileHeaderProps = {
  gradientColor: string;
  name: string;
};

const HEADER_HEIGHT = 120;

function ProfileHeader({ gradientColor, name }: ProfileHeaderProps) {
  return (
    <View className="relative" style={{ height: HEADER_HEIGHT }}>
      <Svg
        height="100%"
        width="100%"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gradientColor} />
            <Stop offset="100%" stopColor={gradientColor} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="140" fill="url(#grad)" />
      </Svg>

      <View className="absolute inset-0 flex-row items-center px-6">
        <View className={cn('overflow-hidden rounded-full border-2 border-white/30', 'size-17')}>
          <Image
            source={require('@assets/images/react-logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>

        <View className="ml-4 flex-1">
          <Text variant="h4" className="text-white">{name}</Text>
          <Text variant="bodySmall" className="mt-0.5 text-white/80">Senior Graphic Designer</Text>
        </View>
      </View>
    </View>
  );
}

export { ProfileHeader };
export type { ProfileHeaderProps };
