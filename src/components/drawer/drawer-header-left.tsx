import { router, useNavigation, usePathname } from 'expo-router';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Button } from '@/components/ui';

const HEADER_ICON_COLOR = '#fff';

export function DrawerHeaderLeft() {
  const pathname = usePathname();
  const navigation = useNavigation();
  const { t } = useTranslation();

  if (pathname.includes('/post/')) {
    return (
      <View className="ml-3">
        <Button
          variant="ghost"
          title=""
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          leftIcon={() => (
            <ArrowLeft
              size={24}
              color={HEADER_ICON_COLOR}
            />
          )}
          onPress={() => router.back()}
          className="h-auto p-0 active:bg-transparent"
        />
      </View>
    );
  }

  return (
    <View className="ml-3">
      <Pressable
        onPress={() => {
          // @ts-expect-error - drawer navigation has toggleDrawer
          navigation.toggleDrawer?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={t('common.openMenu')}
        className="size-10 items-center justify-center"
      >
        <Menu size={24} color={HEADER_ICON_COLOR} />
      </Pressable>
    </View>
  );
}
