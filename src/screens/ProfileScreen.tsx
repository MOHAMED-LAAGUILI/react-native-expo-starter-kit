import { Globe, Mail, Phone, X } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { InfoRow } from "@/components/common/InfoRow";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { COLOR_PALETTES } from "@/config/color-palettes";
import { cn } from "@/lib/utils";
import { useAuthStore, useThemeStore } from "@/store";

type InfoItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
};

function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const primaryColor = useThemeStore(s => s.primaryColor);

  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const gradientColor = palette?.color ?? "#2563eb";

  const infoItems: InfoItem[] = [
    { icon: Mail, label: "Email", value: "james011@gmail.com" },
    { icon: Phone, label: "Mobile", value: "1234567891" },
    { icon: X, label: "Twitter", value: "@james012" },
    { icon: Globe, label: "Behance", value: "www.behance.net/jones012" },
    { icon: Globe, label: "Facebook", value: "www.facebook.com/james012" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      {/* Gradient Wave Header */}
      <View className="relative ">
        <Svg
          height={100}
          width="100%"
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient
              id="grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
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
            width="400"
            height="220"
            fill="url(#grad)"
          />
          <Path
            d="M0,180 Q100,140 200,170 T400,150 L400,220 L0,220 Z"
            fill="url(#grad)"
            opacity={0.6}
          />
          <Path
            d="M0,200 Q150,170 300,195 T400,185 L400,220 L0,220 Z"
            fill="#ffffff"
          />
        </Svg>
      </View>

      {/* Avatar */}
      <View className="items-center -mt-20 relative z-10">
        <View className={cn("rounded-full border-4 border-background overflow-hidden", "w-25 h-25")}>
          <View className="w-full h-full bg-muted items-center justify-center">
            <Text
              variant="h1"
              className="text-muted-foreground"
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "J"}
            </Text>
          </View>
        </View>
       
      </View>

      {/* User Info */}
      <View className="items-center mt-3 px-6">
        <Text variant="h3">{user?.name ?? "James Martin"}</Text>
        <Text
          variant="body"
          className="text-muted-foreground mt-1"
        >
          Senior Graphic Designer
        </Text>
      </View>

      {/* Info Cards */}
      <View className="mt-6 px-6">
        <View className="bg-card rounded-2xl border border-border overflow-hidden">
          {infoItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <View className="h-px bg-border mx-4" />}
              <InfoRow
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View className="px-6 mt-6 mb-8">
        <Button
          title="Logout"
          variant="outline"
          onPress={logout}
        />
      </View>
    </ScrollView>
  );
}

export { ProfileScreen };
