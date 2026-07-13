import { Tabs, useRouter } from 'expo-router';
import { Home, Search, Settings, Smartphone, User } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useThemeStore } from '@/store';

const TAB_CONFIG = {
  'search': { icon: Search, label: 'Search', href: '/(app)/(tabs)/search' as const },
  'profile': { icon: User, label: 'Profile', href: '/(app)/(tabs)/profile' as const },
  'index': { icon: Home, label: 'Home', href: '/' as const },
  'settings': { icon: Settings, label: 'Settings', href: '/(app)/(tabs)/settings' as const },
  'device-info': { icon: Smartphone, label: 'Device Info', href: '/(app)/(tabs)/device-info' as const },
} as const;

function TabItem({
  focused,
  icon: Icon,
  label,
  href,
  primaryHex,
  isDark,
}: {
  focused: boolean;
  icon: typeof Home;
  label: string;
  href: string;
  primaryHex: string;
  isDark: boolean;
}) {
  const router = useRouter();

  const borderScale = useSharedValue(focused ? 1 : 0);

  borderScale.value = withSpring(focused ? 1 : 0, {
    mass: 0.4,
    damping: 8,
    stiffness: 120,
  });

  const borderStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: borderScale.value }],
  }));

  const inactiveBg = isDark ? '#000' : '#fff';
  const inactiveColor = isDark ? '#a1a1aa' : primaryHex;

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
        {label}
      </Text>
    </Pressable>
  );
}

function CustomTabBar({ state }: { state: { routes: Array<{ key: string; name: string }>; index: number }; descriptors: Record<string, { options: Record<string, unknown> }> }) {
  const primaryColor = useThemeStore(s => s.primaryColor);
  const primaryHex = useMemo(() => COLOR_PALETTES.find(p => p.key === primaryColor)?.color ?? '#3b82f6', [primaryColor]);
  const { isDark } = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const inactiveBg = isDark ? '#000' : '#fff';
  const inactiveColor = isDark ? '#a1a1aa' : primaryHex;

  return (
    <View style={{ backgroundColor: inactiveBg, paddingBottom: insets.bottom }}>
      <View className="relative flex-row border-t border-border">
        {state.routes.map((r, i) => {
          const isFocused = i === state.index;
          const config = TAB_CONFIG[r.name as keyof typeof TAB_CONFIG];
          const isHome = r.name === 'index';

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
                        style={{
                          height: 52,
                          width: 52,
                          borderRadius: 26,
                          backgroundColor: primaryHex,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: primaryHex,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.35,
                          shadowRadius: 6,
                          elevation: 5,
                        }}
                      >
                        <Home size={26} color="#fff" />
                      </View>
                    )
                  : (
                      <View
                        style={{
                          height: 52,
                          width: 52,
                          borderRadius: 26,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          borderWidth: 1,
                          borderColor: inactiveColor,
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
              label={config.label}
              href={config.href}
              primaryHex={primaryHex}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="search" options={{ headerTitle: 'Search' }} />
      <Tabs.Screen name="profile" options={{ headerTitle: 'Profile' }} />
      <Tabs.Screen name="index" options={{ headerTitle: 'Home' }} />
      <Tabs.Screen name="settings" options={{ headerTitle: 'Settings' }} />
      <Tabs.Screen name="device-info" options={{ headerTitle: 'Device Info' }} />
    </Tabs>
  );
}
