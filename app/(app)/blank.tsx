import { View } from "react-native";
import { Text } from "@/components/ui/Text";

function Screen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text
        variant="h4"
        className="text-muted-foreground"
      >
        Page Title
      </Text>
    </View>
  );
}

export default Screen;
