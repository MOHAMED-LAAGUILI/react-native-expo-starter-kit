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
import { cn } from '@/utils/cn';

function UserAvatar({ className }: { className?: string }) {
  return (
    <View className={cn('bg-muted overflow-hidden rounded-full', className ?? 'size-9')}>
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
          className="size-8 rounded-full p-0 active:bg-transparent"
          hitSlop={8}
          leftIcon={() => <UserAvatar className="size-8" />}
        />
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-48 max-w-[calc(100vw-2rem)] p-0 sm:w-48">
        <View className="p-2">
          <View className="mb-2 flex-row items-center gap-2">
            <UserAvatar className="size-8" />
            <View className="flex-1">
              <Text className="text-sm/5 font-medium" numberOfLines={1}>{user?.name ?? 'Guest'}</Text>
              {user?.role
                ? (
                    <Text className="text-muted-foreground text-xs font-normal" numberOfLines={1}>
                      {user.role}
                    </Text>
                  )
                : null}
            </View>
          </View>
          <Separator className="mb-1.5" />
          <View className="flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              title={t('profile')}
              leftIconComponent={UserIcon}
              className="h-9 justify-start gap-2 px-2"
              onPress={() => onNavigate('/(app)/(tabs)/profile')}
            />
            <Separator className="my-0.5" />
            <Button
              variant="ghost"
              size="sm"
              title={t('manageAccount')}
              leftIconComponent={SettingsIcon}
              className="h-9 justify-start gap-2 px-2"
              onPress={() => onNavigate('/(app)/(tabs)/settings')}
            />
            <Separator className="my-0.5" />
            <Button
              variant="ghost"
              size="sm"
              title={t('signOut')}
              leftIconComponent={LogOutIcon}
              className="h-9 justify-start gap-2 px-2"
              onPress={onSignOut}
            />
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}
