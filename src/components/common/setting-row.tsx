import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Text } from '../ui/text';

type SettingRowProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
};

export function SettingRow({ icon: Icon, label, subtitle, rightElement, onPress }: SettingRowProps) {
  const { text, muted } = useThemeColors();

  return (
    <Pressable
      className={cn('active:bg-accent flex-row items-center p-4')}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon
        size={22}
        color={text}
      />
      <View className="ml-3 flex-1">
        <Text variant="body">{label}</Text>
        {subtitle && (
          <Text
            variant="caption"
            className="text-muted-foreground mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {onPress && (
        <ChevronRight
          size={18}
          color={muted}
        />
      )}
    </Pressable>
  );
}
