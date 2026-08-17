import type { CategoryCard } from '@/data/home';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionTitle, Text } from '@/components/ui';
import { CATEGORIES } from '@/data/home';
import { isIOS } from '@/utils/platform';

function CategoryCardItem({ item }: { item: CategoryCard }) {
  const Icon = item.icon;

  return (
    <Pressable
      id={`home-category-${item.id}`}
      className="min-w-[45%] flex-1 rounded-2xl border border-border bg-card p-4 active:opacity-70"
      style={{ minWidth: '45%' }}
      onPress={() => router.push(item.href)}
    >
      <View
        className="mb-3 size-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${item.color}18` }}
      >
        <Icon size={22} color={item.color} />
      </View>
      <Text variant="label" className="font-semibold" numberOfLines={1}>
        {item.label}
      </Text>
      <Text variant="caption" className="mt-0.5 text-muted-foreground" numberOfLines={2}>
        {item.description}
      </Text>
    </Pressable>
  );
}

function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-6 p-6">
        <SectionTitle title="Component Showcase" />
        <Text variant="body" className="mb-3 text-muted-foreground">
          Tap a category to explore its demos.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CATEGORIES.map(item => (
            <CategoryCardItem key={item.id} item={item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export { HomeScreen };
