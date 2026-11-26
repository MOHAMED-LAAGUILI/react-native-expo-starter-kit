import { View } from 'react-native';
import { UserMenu } from './user-menu';

export function DrawerHeaderRight() {
  return (
    <View className="mr-3 flex-row items-center gap-2">
      <UserMenu />
    </View>
  );
}
