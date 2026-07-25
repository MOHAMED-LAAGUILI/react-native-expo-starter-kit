import { router } from 'expo-router';
import { LogOut, Settings } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useAuthStore } from '@/store';
import { isWeb } from '@/utils/platform';
import { showToast } from '../ui/toaster';

export function DrawerHeaderRight() {
  const logout = useAuthStore(s => s.logout);

  return (
    <View className="mr-3 flex-row gap-2">
      <HeaderButtons>
        <Item
          IconComponent={Settings}
          title="Settings"
          iconName="settings"
          color="#fff"
          onPress={() => router.push('/(app)/(tabs)/settings')}
        />
        <Item
          IconComponent={LogOut}
          title="Logout"
          iconName="log-out"
          color="#fff"
          onPress={() => {
            if (isWeb) {
              logout();
              showToast({ message: 'You have been logged out.', title: 'Signed out', variant: 'success' });
            }
            else {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                      logout();
                      showToast({ message: 'You have been logged out.', title: 'Signed out', variant: 'success' });
                    },
                  },
                ],
                { cancelable: true },
              );
            }
          }}
        />

      </HeaderButtons>
    </View>
  );
}
