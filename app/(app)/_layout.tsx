import { type Href, router, usePathname, useRouter } from "expo-router";
import { Drawer, DrawerContentScrollView, DrawerItem, DrawerToggleButton } from "expo-router/drawer";
import { Home, type LucideIcon, Search, Settings, User, UserCircle2 } from "lucide-react-native";
import { type ComponentProps, useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useAuthStore } from "@/store";
import { useUniwind } from "uniwind";
import { useThemeColors } from "@/hooks/useThemeColor";

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
const colors = useThemeColors();
  
  return (
    <View className="ml-3">
      <DrawerToggleButton 
      tintColor={colors.icon}
    
      />
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

  const title = useMemo(() => getCurrentTitle(pathname), [pathname]);

  return <Text>{title}</Text>;
}

function AppDrawerContent(props: AppDrawerContentProps) {
  const pathname = usePathname();

  return (
    <DrawerContentScrollView {...props}>
      {ROUTES.map(({ label, href, icon: Icon, match }) => (
        <DrawerItem
          key={label}
          label={label}
          focused={match.includes(pathname)}
          icon={({ color, size }) => (
            <Icon
              color={color}
              size={size}
            />
          )}
          onPress={() => router.push(href)}
        />
      ))}
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
    </Drawer>
  );
}
