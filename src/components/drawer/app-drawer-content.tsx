import type Drawer from 'expo-router/drawer';
import type { ComponentProps } from 'react';
import { router, usePathname } from 'expo-router';
import { DrawerContentScrollView } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/ui';
import { NAV_ITEMS } from '@/config/navigation';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { DrawerProfileHeader } from './drawer-profile-header';

type AppDrawerContentProps = Parameters<NonNullable<ComponentProps<typeof Drawer>['drawerContent']>>[0];

function normalizePath(path: string | { pathname: string; params?: unknown }) {
  return typeof path === 'string' ? path : path.pathname;
}

export function AppDrawerContent(props: AppDrawerContentProps) {
  const pathname = usePathname();
  const { background, text } = useThemeColors();
  const primaryHex = usePrimaryHex();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: background, overflow: 'hidden' }}>
      <DrawerProfileHeader />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          flexGrow: 1,
        }}
      >
        {NAV_ITEMS.map(({ label, translationKey, href, icon: Icon, match }) => {
          const currentPath = normalizePath(pathname);
          const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
          const isActive = match.includes(normalizedPath);

          return (
            <Button
              key={label}
              variant={isActive ? 'primary' : 'ghost'}
              title={t(translationKey)}
              size="md"
              leftIcon={() => (
                <Icon
                  size={22}
                  color={isActive ? '#fff' : text}
                />
              )}
              className={cn('mb-2 w-full justify-start gap-3', !isActive && 'bg-transparent', isActive && 'text-white!')}
              style={isActive ? { backgroundColor: primaryHex } : undefined}
              onPress={() => router.push(href)}
            />
          );
        })}
      </DrawerContentScrollView>
    </View>
  );
}
