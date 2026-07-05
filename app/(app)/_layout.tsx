import { type Href, router, usePathname, useRouter } from "expo-router";
import { Drawer, DrawerContentScrollView, DrawerItem, DrawerToggleButton } from "expo-router/drawer";
import { ArrowLeft, Home, type LucideIcon, Search, Settings, User, UserCircle2 } from "lucide-react-native";
import { type ComponentProps, useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/store";

type AppDrawerContentProps = Parameters<NonNullable<ComponentProps<typeof Drawer>["drawerContent"]>>[0];

const ROUTES = [
  {
    href: "/(app)/(tabs)" as Href,
    icon: Home,
    label: "Home",
    match: ["/(app)", "/(app)/(tabs)", "/(app)/(tabs)/index"],
  },
  {
    href: "/(app)/(tabs)/search" as Href,
    icon: Search,
    label: "Search",
    match: ["/(app)/(tabs)/search"],
  },
  {
    href: "/(app)/(tabs)/profile" as Href,
    icon: User,
    label: "Profile",
    match: ["/(app)/(tabs)/profile"],
  },
  {
    href: "/(app)/(tabs)/settings" as Href,
    icon: Settings,
    label: "Settings",
    match: ["/(app)/(tabs)/settings"],
  },
] satisfies Array<{
  label: string;
  href: Href;
  icon: LucideIcon;
  match: string[];
}>;

function getCurrentTitle(pathname: string) {
  if (pathname.includes("/post/")) return "Post";
  const normalizedPathname = pathname.replace(/\/+$/, "");
  const segments = normalizedPathname.split("/").filter(Boolean);
  const currentSegment = segments.at(-1);

  switch (currentSegment) {
    case "search":
      return "Search";
    case "profile":
      return "Profile";
    case "settings":
      return "Settings";
    case "index":
    case "(tabs)":
    case "(app)":
    default:
      return "Home";
  }
}

function DrawerHeaderLeft() {
  const pathname = usePathname();
  const { icon } = useThemeColors();

  if (pathname.includes("/post/")) {
    return (
      <View className="ml-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ArrowLeft size={24} color={icon} />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="ml-3">
      <DrawerToggleButton tintColor={icon} />
    </View>
  );
}

function DrawerHeaderRight() {
  return (
    <HeaderButtons>
      <Item
        IconComponent={UserCircle2}
        title="Profile"
        iconName="person"
        onPress={() => router.push("/(app)/(tabs)/profile")}
      />
    </HeaderButtons>
  );
}

function HeaderTitle() {
  const pathname = usePathname();
  const { text } = useThemeColors();

  const title = useMemo(() => getCurrentTitle(pathname), [pathname]);

  return (
    <Text className="text-xl font-bold" style={{ color: text }}>
      {title}
    </Text>
  );
}

function AppDrawerContent(props: AppDrawerContentProps) {
  const pathname = usePathname();
  const { text, background } = useThemeColors();

  return (
    <DrawerContentScrollView {...props}>
      {ROUTES.map(({ label, href, icon: Icon, match }) => {
        const isActive = match.includes(pathname);

        return (
          <DrawerItem
            key={label}
            label={label}
            focused={isActive}
            activeBackgroundColor={isActive ? "#2563eb" : background + "00"}
            activeTintColor={isActive ? "#ffffff" : text}
            icon={({ color, size }) => <Icon color={isActive ? "#ffffff" : color} size={size} />}
            onPress={() => router.push(href)}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigation = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("/(auth)/login");
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Drawer
      drawerContent={props => <AppDrawerContent {...props} />}
      screenOptions={{
        headerLeft: DrawerHeaderLeft,
        headerRight: DrawerHeaderRight,
        headerTitle: HeaderTitle,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="post/[id]"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: true,
        }}
      />
    </Drawer>
  );
}
