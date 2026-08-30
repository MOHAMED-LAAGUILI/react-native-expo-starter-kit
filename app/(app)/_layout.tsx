import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { useEffect } from 'react';
import { AppDrawerContent } from '@/components/drawer/app-drawer-content';
import { DrawerHeaderLeft } from '@/components/drawer/drawer-header-left';
import { DrawerHeaderRight } from '@/components/drawer/drawer-header-right';
import { HeaderTitle } from '@/components/drawer/header-title';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useAuthStore } from '@/store';

function renderDrawerContent(props: ComponentProps<typeof AppDrawerContent>) {
  return <AppDrawerContent {...props} />;
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const primaryHex = usePrimaryHex();
  const navigation = useRouter();

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
      drawerContent={renderDrawerContent}
      screenOptions={{
        freezeOnBlur: true,
        headerLeft: DrawerHeaderLeft,
        headerRight: DrawerHeaderRight,
        headerStyle: { backgroundColor: primaryHex },
        headerTintColor: '#fff',
        headerTitle: HeaderTitle,
        drawerStyle: { width: '80%' },
      }}
    />
  );
}
