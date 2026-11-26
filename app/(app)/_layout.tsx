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

// Expo Router SDK 58: Drawer only registers screens declared here — a route
// file without a matching entry is unreachable. Keep in sync with `app/(app)/`.
const DRAWER_ROUTES = [
  '(tabs)',
  'blocks',
  'dev-data',
  'dev-forms',
  'dev-media',
  'dev-onboarding',
  'dev-preferences',
  'dev-test',
  'dev-ui',
  'parallax',
  'post/[id]',
] as const;

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
        headerLeft: DrawerHeaderLeft,
        headerRight: DrawerHeaderRight,
        headerStyle: { backgroundColor: primaryHex },
        headerTintColor: '#fff',
        headerTitle: HeaderTitle,
        drawerStyle: { width: '80%' },
      }}
    >
      {DRAWER_ROUTES.map(name => (
        <Drawer.Screen key={name} name={name} />
      ))}
    </Drawer>
  );
}
