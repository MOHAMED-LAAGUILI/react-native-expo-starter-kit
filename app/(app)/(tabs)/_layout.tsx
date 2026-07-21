import { Tabs, useRouter } from 'expo-router';
import { BarChart3, Home, Search, Settings, Smartphone } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

const TAB_CONFIG = {
  'search': { icon: Search, translationKey: 'navigation.search', href: '/(app)/(tabs)/search' as const },
  'report': { icon: BarChart3, translationKey: 'navigation.charts', href: '/(app)/(tabs)/report' as const },
  'index': { icon: Home, translationKey: 'navigation.home', href: '/' as const },
  'settings': { icon: Settings, translationKey: 'navigation.settings', href: '/(app)/(tabs)/settings' as const },
  'device-info': { icon: Smartphone, translationKey: 'navigation.deviceInfo', href: '/(app)/(tabs)/device-info' as const },
} as const;

function TabItem({
  focused,
  icon: Icon,
  translationKey,
  href,
  primaryHex,
  isDark,
  t,
}: {
  focused: boolean;
  icon: typeof Home;
  translationKey: string;
  href: string;
  primaryHex: string;
  isDark: boolean;
  t: (key: string) => string;
}) {
  const router = useRouter();

  const borderScale = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    borderScale.set(withSpring(focused ? 1 : 0, {
      mass: 0.4,
      damping: 8,
      stiffness: 120,
    }));
  }, [focused, borderScale]);

  const borderStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: borderScale.get() }],
  }));

  const inactiveBg = isDark ? '#000' : '#fff';
  const inactiveColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <Pressable
      onPress={() => router.push(href as any)}
      className="flex-1 items-center gap-0.5 pt-1 pb-2"
      style={{ backgroundColor: focused ? `${primaryHex}10` : inactiveBg }}
    >
      <View className="absolute -top-px h-0.5 w-full items-center justify-center">
        <Animated.View
          style={[
            {
              height: '100%',
              width: '100%',
              borderRadius: 2,
              backgroundColor: primaryHex,
            },
            borderStyle,
          ]}
        />
      </View>
      <View className="mt-2">
        <Icon size={20} color={focused ? primaryHex : inactiveColor} />
      </View>
      <Text
        className="text-[10px]"
        style={{ color: focused ? primaryHex : inactiveColor }}
      >
        {t(translationKey)}
      </Text>
    </Pressable>
  );
}

function CustomTabBar({ state }: { state: { routes: Array<{ key: string; name: string }>; index: number }; descriptors: Record<string, { options: Record<string, unknown> }> }) {
  const primaryHex = usePrimaryHex();
  const { isDark } = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const inactiveBg = isDark ? '#000' : '#fff';
  const inactiveColor = isDark ? '#a1a1aa' : '#71717a';
  const inactiveBorder = isDark ? '#3f3f46' : '#d4d4d8';

  return (
    <View style={{ backgroundColor: inactiveBg, paddingBottom: insets.bottom }}>
      <View className="relative flex-row border-t border-border">
        {state.routes.map((r, i) => {
          const isFocused = i === state.index;
          const config = TAB_CONFIG[r.name as keyof typeof TAB_CONFIG];
          const isHome = r.name === 'index';

          if (!config)
            return null;

          if (isHome) {
            return (
              <Pressable
                key={r.key}
                onPress={() => router.push('/')}
                className="flex-1 items-center justify-center"
                style={{ marginTop: -24 }}
              >
                {isFocused
                  ? (
                      <View
                        className="size-[52] items-center justify-center rounded-full"
                        style={{
                          backgroundColor: primaryHex,
                          boxShadow: `0px 2px 10px ${primaryHex}99`,
                        }}
                      >
                        <Home size={26} color="#fff" />
                      </View>
                    )
                  : (
                      <View
                        className="size-[52] items-center justify-center rounded-full border"
                        style={{
                          borderColor: inactiveBorder,
                          backgroundColor: inactiveBg,
                        }}
                      >
                        <Home size={26} color={inactiveColor} />
                      </View>
                    )}
              </Pressable>
            );
          }

          return (
            <TabItem
              key={r.key}
              focused={isFocused}
              icon={config.icon}
              translationKey={config.translationKey}
              href={config.href}
              primaryHex={primaryHex}
              isDark={isDark}
              t={t}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="search" options={{ headerTitle: t('navigation.search') }} />
      <Tabs.Screen name="report" options={{ headerTitle: t('navigation.charts') }} />
      <Tabs.Screen name="index" options={{ headerTitle: t('navigation.home') }} />
      <Tabs.Screen name="settings" options={{ headerTitle: t('navigation.settings') }} />
      <Tabs.Screen name="device-info" options={{ headerTitle: t('navigation.deviceInfo') }} />
    </Tabs>
  );
}
