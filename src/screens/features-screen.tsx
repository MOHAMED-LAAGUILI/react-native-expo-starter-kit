import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    description: 'Light/dark mode with 7 accent color palettes using Tailwind v4 CSS variables.',
    icon: '🎨',
    title: 'Theming',
  },
  {
    description: 'Internationalization with English and French. MMKV-persisted language preference.',
    icon: '🌍',
    title: 'i18n',
  },
  {
    description: 'Zustand auth store with MMKV persistence, Axios interceptor, and refresh queue.',
    icon: '🔐',
    title: 'Authentication',
  },
  {
    description: 'Expo Router with Stack, Drawer, and Tabs navigation out of the box.',
    icon: '📄',
    title: 'File-based Routing',
  },
  {
    description: 'Axios with typed hooks via TanStack Query. Stale-while-revalidate caching.',
    icon: '📡',
    title: 'API Client',
  },
  {
    description: 'TanStack Form with Zod validation. Type-safe field handling and error display.',
    icon: '📋',
    title: 'Forms',
  },
  {
    description: 'Lottie onboarding animations, Reanimated carousel, gesture-driven bottom sheets.',
    icon: '⚡',
    title: 'Animations',
  },
  {
    description: 'Zustand for client state, TanStack Query for server state. MMKV persistence.',
    icon: '🗄️',
    title: 'State Management',
  },
];

export function FeaturesScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        <Text
          variant="h3"
          className="text-center"
        >
          All Features
        </Text>

        <View className="gap-4">
          {FEATURES.map(feature => (
            <View
              key={feature.title}
              className="flex-row items-start gap-4 rounded-xl border border-border bg-card p-4"
            >
              <View className="size-10 items-center justify-center rounded-lg bg-primary/10">
                <Text className="text-xl">{feature.icon}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text variant="label">{feature.title}</Text>
                <Text
                  variant="bodySmall"
                  className="leading-5 text-muted-foreground"
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
