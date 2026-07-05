import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { useThemeStore } from "@/store";

function LoadingScreen() {
  const themeMode = useThemeStore(s => s.mode);
  const isDark = themeMode === "dark";
  const background = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <View className="flex-1 items-center justify-center gap-4" style={{ backgroundColor: background }}>
      <ActivityIndicator size="large" color={textColor} />
    </View>
  );
}

export { LoadingScreen };
