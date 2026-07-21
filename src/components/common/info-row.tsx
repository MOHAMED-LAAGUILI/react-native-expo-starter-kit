import type { GestureResponderEvent } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Text } from '../ui/text';

type InfoRowProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  href?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export function InfoRow({ icon: Icon, label, value, href, onPress }: InfoRowProps) {
  const { muted } = useThemeColors();
  const isLink = !!href;

  return (
    <Pressable
      className="flex-row items-center p-4 active:bg-accent"
      onPress={isLink ? onPress : undefined}
      disabled={!isLink}
    >
      <View className="mr-3 size-10 items-center justify-center rounded-full bg-muted">
        <Icon
          size={20}
          color={muted}
        />
      </View>
      <View className="flex-1">
        <Text
          variant="caption"
          className="text-muted-foreground"
        >
          {label}
        </Text>
        <Text
          variant="body"
          className={cn('mt-0.5', isLink && 'text-primary')}
        >
          {value}
        </Text>
      </View>
      {isLink && (
        <ExternalLink
          size={16}
          color={muted}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}
