import { router, usePathname } from "expo-router";
import Drawer, { DrawerContentScrollView } from "expo-router/drawer";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { COLOR_PALETTES } from "@/config/color-palettes";
import { NAV_ITEMS } from "@/config/navigation";
import { useThemeColors } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store";
import { DrawerProfileHeader } from "./DrawerProfileHeader";

type AppDrawerContentProps = Parameters<NonNullable<ComponentProps<typeof Drawer>["drawerContent"]>>[0];

function normalizePath(path: string | { pathname: string; params?: unknown }) {
  return typeof path === "string" ? path : path.pathname;
}

export function AppDrawerContent(props: AppDrawerContentProps) {
  const pathname = usePathname();
  const { background, text } = useThemeColors();
  const primaryColor = useThemeStore(s => s.primaryColor);
  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const primaryHex = palette?.color ?? "#3b82f6";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        backgroundColor: background,
        flexGrow: 1,
        paddingHorizontal: 0,
        paddingTop: 0,
      }}
    >
      <DrawerProfileHeader />

      <View className="mt-4 px-4 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
          const currentPath = normalizePath(pathname);
          const normalizedPath = currentPath.replace(/\/+$/, "") || "/";
          const isActive = match.some(p => normalizedPath === p);

          return (
            <Button
              key={label}
              variant={isActive ? "primary" : "ghost"}
              title={label}
              size="md"
              leftIcon={
                <Icon
                  size={22}
                  color={isActive ? "#fff" : text}
                />
              }
              className={cn("mb-2 justify-start w-full gap-3", !isActive && "bg-transparent")}
              style={isActive ? { backgroundColor: primaryHex } : undefined}
              onPress={() => router.push(href)}
            />
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}
