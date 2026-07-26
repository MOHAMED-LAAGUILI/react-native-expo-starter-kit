import { ScrollView, View } from 'react-native';
import { EditProfileForm, ProfileHeader } from '@/components/profile';

function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <ProfileHeader />

      <View className="px-6">
        <EditProfileForm />
      </View>
    </ScrollView>
  );
}

export { ProfileScreen };
