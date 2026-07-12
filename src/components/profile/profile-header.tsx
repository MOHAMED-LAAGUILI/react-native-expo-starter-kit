import { Dimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Text } from '@/components/ui';
import { cn } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SVG_HEIGHT = Math.round(SCREEN_WIDTH * 0.5);

type ProfileHeaderProps = {
  gradientColor: string;
  name: string;
  initial: string;
};

function ProfileHeader({ gradientColor, name, initial }: ProfileHeaderProps) {
  return (
    <View className="relative" style={{ height: SVG_HEIGHT }}>
      <Svg
        height={SVG_HEIGHT}
        width="100%"
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gradientColor} />
            <Stop offset="100%" stopColor={gradientColor} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="220" fill="url(#grad)" />
        <Path d="M0,180 Q100,140 200,170 T400,150 L400,220 L0,220 Z" fill="url(#grad)" opacity={0.6} />
      </Svg>

      <View className="absolute inset-0 z-10 items-center justify-center">
        <View className={cn('overflow-hidden rounded-full border-4 border-background', 'size-25')}>
          <View className="size-full items-center justify-center bg-muted">
            <Text variant="h1" className="text-white">{initial}</Text>
          </View>
        </View>
        <View className="mt-3 items-center">
          <Text variant="h3" className="text-white">{name}</Text>
          <Text variant="body" className="mt-1 text-white/80">Senior Graphic Designer</Text>
        </View>
      </View>
    </View>
  );
}

export { ProfileHeader };
export type { ProfileHeaderProps };
