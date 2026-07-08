import { useRouter } from "expo-router";
import Drawer from "expo-router/drawer";
import { useEffect } from "react";
import { AppDrawerContent } from "@/components/drawer/AppDrawerContent";
import { DrawerHeaderLeft } from "@/components/drawer/DrawerHeaderLeft";
import { DrawerHeaderRight } from "@/components/drawer/DrawerHeaderRight";
import { HeaderTitle } from "@/components/drawer/HeaderTitle";
import { useAuthStore } from "@/store";

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
      <Drawer.Screen
        name="features"
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="blank"
        options={{
          headerShown: true,
        }}
      />
    </Drawer>
  );
}
