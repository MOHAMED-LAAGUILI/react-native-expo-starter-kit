import { ScrollView } from 'react-native';
import { Card } from '@/components/ui';
import { cardListData } from '@/data/cards';

function CardListDemo() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-1"
      className="w-full"
    >
      {cardListData.map(item => (
        <Card
          key={item.id}
          variant={item.variant || 'stats'}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
          className="w-48"
        />
      ))}
    </ScrollView>
  );
}

export { CardListDemo };
