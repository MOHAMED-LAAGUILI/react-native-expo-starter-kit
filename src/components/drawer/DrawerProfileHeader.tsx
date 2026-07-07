import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import { COLOR_PALETTES } from "@/config/color-palettes";
import { cn } from "@/lib/utils";
import { useAuthStore, useThemeStore } from "@/store";

export function DrawerProfileHeader() {
  const user = useAuthStore(s => s.user);
  const primaryColor = useThemeStore(s => s.primaryColor);
  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const gradientColor = palette?.color ?? "#2563eb";
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
        style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient
            id="drawerGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor={gradientColor}
            />
            <Stop
              offset="100%"
              stopColor={gradientColor}
              stopOpacity={0.7}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#drawerGrad)"
        />
      </Svg>

      <View
        className="absolute left-0 right-0 flex-row items-center px-4"
        style={{ bottom: 0, top: safeTop }}
      >
        <View className={cn("rounded-full border-2 border-white/30 overflow-hidden", "w-17 h-17")}>
          <View className="w-full h-full bg-white/20 items-center justify-center">
            <Text
              variant="h1"
              className="text-white"
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "J"}
            </Text>
          </View>
        </View>

        <View className="ml-4 flex-1">
          <Text
            variant="h4"
            className="text-white"
          >
            {user?.name ?? "James Martin"}
          </Text>
          <Text
            variant="bodySmall"
            className="text-white/80 mt-0.5"
          >
            {"Senior Graphic Designer"}
          </Text>
        </View>
      </View>
    </View>
  );
}
