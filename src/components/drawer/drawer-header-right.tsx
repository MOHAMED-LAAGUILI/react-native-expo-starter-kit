import { router } from 'expo-router';
import { UserCircle2 } from 'lucide-react-native';
import { View } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

export function DrawerHeaderRight() {
  return (
    <View className="mr-3">
      <HeaderButtons>
        <Item
          IconComponent={UserCircle2}
          title="Profile"
          iconName="person"
          color="#fff"
          onPress={() => router.push('/(app)/(tabs)/profile')}
        />
      </HeaderButtons>
    </View>
  );
}
