import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { InfoCards, ProfileHeader } from '@/components/profile';
import { Button } from '@/components/ui';
import { showToast } from '@/components/ui/toast';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { PROFILE_INFO_ITEMS } from '@/data/profile-info';
import { useAuthStore, useThemeStore } from '@/store';

function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const primaryColor = useThemeStore(s => s.primaryColor);

  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const gradientColor = palette?.color ?? '#2563eb';
  const name = user?.name ?? 'James Martin';

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <ProfileHeader gradientColor={gradientColor} name={name} />

      <View className="mt-6 px-6">
        <InfoCards items={PROFILE_INFO_ITEMS} />
      </View>

      <View className="mt-6 mb-8 px-6">
        <Button
          title="Logout"
          variant="primary"
          onPress={() => {
            logout();
            showToast({ message: 'You have been logged out.', title: 'Signed out', variant: 'success' });
          }}
        />
      </View>
    </ScrollView>
  );
}

export { ProfileScreen };
