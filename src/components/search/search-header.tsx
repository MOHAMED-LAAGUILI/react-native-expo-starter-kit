import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Input, Text } from '@/components/ui';

function SearchHeader({
  query,
  onQueryChange,
  count,
  isLoading,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  count: number;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="p-6 pb-0">
      <Input
        placeholder={t('search.placeholder')}
        value={query}
        onChangeText={onQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
        type="search"
      />
      <Text
        variant="caption"
        className="text-muted-foreground mt-2 mb-1"
      >
        {isLoading ? t('common.loading') : t('search.postCount', { count })}
      </Text>
    </View>
  );
}

export { SearchHeader };
