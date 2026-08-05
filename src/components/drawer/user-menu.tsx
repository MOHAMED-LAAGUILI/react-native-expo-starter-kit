import type { TriggerRef } from '@rn-primitives/popover';
import { router, usePathname } from 'expo-router';
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Image, Separator, Text } from '@/components/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { showToast } from '@/components/ui/toaster';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/utils';

function UserAvatar({ className }: { className?: string }) {
  return (
    <View className={cn('overflow-hidden rounded-full bg-muted', className ?? 'size-9')}>
      <Image
        source={require('@assets/images/logo.png')}
        className="size-full"
        style={{ height: '100%', width: '100%' }}
        contentFit="cover"
        accessibilityLabel="User avatar"
        fallback="user"
      />
    </View>
  );
}

export function UserMenu() {
  const { t } = useTranslation('user-menu');
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const popoverTriggerRef = React.useRef<TriggerRef>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    popoverTriggerRef.current?.close();
  }, [pathname]);

  function onSignOut() {
    popoverTriggerRef.current?.close();
    logout();
    showToast({
      message: 'You have been logged out.',
      title: 'Signed out',
      variant: 'success',
    });
  }

  function onNavigate(path: Parameters<typeof router.push>[0]) {
    popoverTriggerRef.current?.close();
    router.push(path);
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button
          variant="ghost"
          title=""
          className="size-9 rounded-full p-0 active:bg-transparent"
          hitSlop={8}
          leftIcon={() => <UserAvatar className="size-9" />}
        />
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-56 max-w-[calc(100vw-2rem)] p-0 sm:w-56">
        <View className="p-3">
          <View className="mb-3 flex-row items-center gap-3">
            <UserAvatar className="size-10" />
            <View className="flex-1">
              <Text className="leading-5 font-medium" numberOfLines={1}>{user?.name ?? 'Guest'}</Text>
              {user?.role
                ? (
                    <Text className="text-sm/4 font-normal text-muted-foreground" numberOfLines={1}>
                      {user.role}
                    </Text>
                  )
                : null}
            </View>
          </View>
          <Separator className="mb-2" />
          <View className="flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              title={t('profile')}
              leftIconComponent={UserIcon}
              className="h-11 justify-start gap-3 px-2"
              onPress={() => onNavigate('/(app)/(tabs)/profile')}
            />
            <Separator className="my-0.5" />
            <Button
              variant="ghost"
              size="sm"
              title={t('manageAccount')}
              leftIconComponent={SettingsIcon}
              className="h-11 justify-start gap-3 px-2"
              onPress={() => onNavigate('/(app)/(tabs)/settings')}
            />
            <Separator className="my-0.5" />
            <Button
              variant="ghost"
              size="sm"
              title={t('signOut')}
              leftIconComponent={LogOutIcon}
              className="h-11 justify-start gap-3 px-2"
              onPress={onSignOut}
            />
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}
