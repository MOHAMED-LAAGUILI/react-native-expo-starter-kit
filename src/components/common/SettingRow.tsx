import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useThemeColors } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

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
      className={cn("flex-row items-center p-4 active:bg-accent")}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon
        size={22}
        color={text}
      />
      <View className="flex-1 ml-3">
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
