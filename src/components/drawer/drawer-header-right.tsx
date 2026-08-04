import { View } from 'react-native';
import { HeaderButtons } from 'react-navigation-header-buttons';
import { UserMenu } from './user-menu';

export function DrawerHeaderRight() {
  return (
    <View className="mr-3 flex-row gap-2">
      <HeaderButtons>
        <UserMenu />
      </HeaderButtons>
    </View>
  );
}
