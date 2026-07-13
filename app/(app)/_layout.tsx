import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { useEffect, useMemo } from 'react';
import { AppDrawerContent } from '@/components/drawer/app-drawer-content';
import { DrawerHeaderLeft } from '@/components/drawer/drawer-header-left';
import { DrawerHeaderRight } from '@/components/drawer/drawer-header-right';
import { HeaderTitle } from '@/components/drawer/header-title';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { useAuthStore, useThemeStore } from '@/store';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state: { isAuthenticated: any }) => state.isAuthenticated);
  const primaryColor = useThemeStore(s => s.primaryColor);
  const navigation = useRouter();

  const primaryHex = useMemo(() => COLOR_PALETTES.find(p => p.key === primaryColor)?.color ?? '#3b82f6', [primaryColor]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('/(auth)/login');
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
        headerStyle: { backgroundColor: primaryHex },
        headerTintColor: '#fff',
        headerTitle: HeaderTitle,
        drawerStyle: { width: '76%' },

      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: 'none' },
          
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="post/[id]"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="expo-ui"
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="preferences"
        options={{
          headerShown: true,
        }}
      />
    </Drawer>
  );
}
