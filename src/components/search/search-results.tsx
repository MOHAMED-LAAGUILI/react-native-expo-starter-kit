import type { PublicPost as Post } from '@/api/types';
import { router } from 'expo-router';
import { Search, SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { PostCard } from '@/components/common/post-card';
import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

function SearchResults({
  posts,
  query,
  isLoading,
}: {
  posts: Post[];
  query: string;
  isLoading: boolean;
}) {
  const { t } = useTranslation('search');
  const primaryHex = usePrimaryHex();
  const { muted } = useThemeColors();

  const handlePress = (id: number) => {
    router.push({
      pathname: '/(app)/post/[id]',
      params: { id: String(id) },
    });
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      id={item.id}
      title={item.title}
      body={item.body}
      imageUrl={item.imageUrl}
      onPress={handlePress}
    />
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={item => String(item.id)}
      contentContainerClassName="px-6 pb-6 gap-2"
      renderItem={renderItem}
      ListEmptyComponent={
        isLoading
          ? (
              <View className="flex-1 items-center justify-center bg-background pt-24">
                <ActivityIndicator size="large" color={primaryHex} />
              </View>
            )
          : (
              <View className="items-center justify-center px-8 pt-24">
                {query
                  ? (
                      <>
                        <SearchX size={48} color={muted} />
                        <Text
                          variant="body"
                          className="text-muted-foreground mt-4 text-center"
                        >
                          {t('noResults')}
                        </Text>
                      </>
                    )
                  : (
                      <>
                        <Search size={48} color={muted} />
                        <Text
                          variant="body"
                          className="text-muted-foreground mt-4 text-center"
                        >
                          {t('startTyping')}
                        </Text>
                      </>
                    )}
              </View>
            )
      }
    />
  );
}

export { SearchResults };
