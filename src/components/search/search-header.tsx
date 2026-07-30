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
  const { t: tSearch } = useTranslation('search');
  const { t } = useTranslation();

  return (
    <View className="p-6 pb-0">
      <Input
        placeholder={tSearch('placeholder')}
        value={query}
        onChangeText={onQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
        type="search"
      />
      <Text
        variant="caption"
        className="mt-2 mb-1 text-muted-foreground"
      >
        {isLoading ? t('common.loading') : tSearch('postCount', { count })}
      </Text>
    </View>
  );
}

export { SearchHeader };
