import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { usePublicPosts } from '@/api/hooks/use-public-posts';
import { SearchHeader, SearchResults } from '@/components/search';
import { Text } from '@/components/ui';

function SearchScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const { data: posts, isLoading, error } = usePublicPosts(query);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text variant="body" className="text-center text-destructive">{t('search.error')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SearchHeader query={query} onQueryChange={setQuery} count={posts?.length ?? 0} isLoading={isLoading} />
      <SearchResults posts={posts ?? []} query={query} isLoading={isLoading} />
    </View>
  );
}

export { SearchScreen };
