import type { ListRenderItem } from 'react-native';
import type { CardItem } from '@/data/cards';
import { FlatList } from 'react-native';
import { Card } from '@/components/ui';
import { cardListData } from '@/data/cards';

// FlatList, not ScrollView + map: only the cards near the viewport are
// mounted, so the row keeps scrolling smoothly when real data grows.
const renderCard: ListRenderItem<CardItem> = ({ item }) => (
  <Card
    variant={item.variant || 'stats'}
    title={item.title}
    value={item.value}
    subtitle={item.subtitle}
    icon={item.icon}
    className="w-48"
  />
);

function CardListDemo() {
  return (
    <FlatList
      horizontal
      data={cardListData}
      keyExtractor={item => String(item.id)}
      renderItem={renderCard}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-1"
      className="w-full"
    />
  );
}

export { CardListDemo };
