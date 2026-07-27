import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AppDrawerContent } from '@/components/drawer/app-drawer-content';
import { DrawerHeaderLeft } from '@/components/drawer/drawer-header-left';
import { DrawerHeaderRight } from '@/components/drawer/drawer-header-right';
import { HeaderTitle } from '@/components/drawer/header-title';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useAuthStore } from '@/store';

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
    return <View className="flex-1 bg-background" />;
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
        drawerStyle: { width: '80%' },
      }}
    />
  );
}
