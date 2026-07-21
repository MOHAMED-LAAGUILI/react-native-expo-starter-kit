import type { ListRenderItem } from 'react-native';
import type { PublicPost as Post } from '@/api/types';
import { router } from 'expo-router';
import { Search, SearchX } from 'lucide-react-native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { PostCard } from '@/components/common/post-card';
import { Text } from '@/components/ui';
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
  const { t } = useTranslation();
  const { muted } = useThemeColors();

  const handlePress = useCallback((id: number) => {
    router.push({
      pathname: '/(app)/post/[id]',
      params: { id: String(id) },
    });
  }, []);

  const renderItem = useCallback<ListRenderItem<Post>>(
    ({ item }) => (
      <PostCard
        id={item.id}
        title={item.title}
        body={item.body}
        imageUrl={item.imageUrl}
        onPress={handlePress}
      />
    ),
    [handlePress],
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
              <View className="items-center justify-center pt-24">
                <ActivityIndicator size="large" color="#3b82f6" />
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
                          className="mt-4 text-center text-muted-foreground"
                        >
                          {t('search.noResults')}
                        </Text>
                      </>
                    )
                  : (
                      <>
                        <Search size={48} color={muted} />
                        <Text
                          variant="body"
                          className="mt-4 text-center text-muted-foreground"
                        >
                          {t('search.startTyping')}
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
