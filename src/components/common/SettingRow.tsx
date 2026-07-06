import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

type SettingRowProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
};

export function SettingRow({ icon: Icon, label, subtitle, rightElement, onPress }: SettingRowProps) {
  return (
    <Pressable
      className={cn("flex-row items-center p-4 active:bg-accent")}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon
        size={22}
        className="text-foreground mr-3"
      />
      <View className="flex-1">
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
          className="text-muted-foreground"
        />
      )}
    </Pressable>
  );
}
