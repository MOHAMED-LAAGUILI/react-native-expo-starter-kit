import type { PublicPost as Post } from '@/api/types';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { PostCard } from '@/components/common/post-card';
import { Text } from '@/components/ui';

function SearchResults({ posts, query }: { posts: Post[]; query: string }) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={posts}
      keyExtractor={item => String(item.id)}
      contentContainerClassName="px-6 pb-6 gap-2"
      renderItem={({ item }) => (
        <PostCard
          id={item.id}
          title={item.title}
          body={item.body}
          imageUrl={item.imageUrl}
          onPress={() => router.push({ params: { id: String(item.id) }, pathname: '/(app)/post/[id]' })}
        />
      )}
      ListEmptyComponent={(
        <View className="flex-1 items-center justify-center pt-12">
          <Text
            variant="body"
            className="text-muted-foreground"
          >
            {query ? t('search.noResults') : t('search.startTyping')}
          </Text>
        </View>
      )}
    />
  );
}

export { SearchResults };
