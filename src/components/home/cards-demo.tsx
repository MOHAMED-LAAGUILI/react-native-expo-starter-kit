import { BarChart3, Box, Zap } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { BottomSheet, Card, Text } from '@/components/ui';

type DemoSheetCard = {
  title: string;
  value: string;
  subtitle: string;
};

const DEMO_CARDS: DemoSheetCard[] = [
  { title: 'Aujourd\'hui', value: '66.00 DH', subtitle: '2 commandes' },
  { title: 'Total des ventes', value: '66.00 DH', subtitle: '2 Total des commandes' },
  { title: 'Stock', value: '2', subtitle: 'Disponibilité du stock' },
  { title: 'Stock bas', value: '1', subtitle: 'Produits à reconstituer' },
];

function CardsDemo() {
  const [selectedCard, setSelectedCard] = React.useState<DemoSheetCard | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleOpenSheet = (card: DemoSheetCard) => {
    setSelectedCard({ ...card });
    setSheetOpen(true);
  };

  return (
    <>
      <View className="gap-4">
        <Card
          variant="primary"
          title={DEMO_CARDS[0].title}
          value={DEMO_CARDS[0].value}
          subtitle={DEMO_CARDS[0].subtitle}
          icon={BarChart3}
          onPress={() => handleOpenSheet(DEMO_CARDS[0])}
        />
        <Card
          variant="stats"
          title={DEMO_CARDS[1].title}
          value={DEMO_CARDS[1].value}
          subtitle={DEMO_CARDS[1].subtitle}
          icon={BarChart3}
          onPress={() => handleOpenSheet(DEMO_CARDS[1])}
        />

        <View className="flex-row gap-3">
          <Card
            variant="compact"
            title={DEMO_CARDS[2].title}
            value={DEMO_CARDS[2].value}
            icon={Box}
            className="flex-1"
            onPress={() => handleOpenSheet(DEMO_CARDS[2])}
          />
          <Card
            variant="compact"
            title={DEMO_CARDS[3].title}
            value={DEMO_CARDS[3].value}
            icon={Zap}
            className="flex-1"
            onPress={() => handleOpenSheet(DEMO_CARDS[3])}
          />
        </View>
      </View>

      <BottomSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSelectedCard(null);
          }
        }}
        title={selectedCard?.title ?? ''}
      >
        {selectedCard && (
          <View className="gap-2 p-4">
            <Text variant="h4">{selectedCard.title}</Text>
            <Text variant="body" className="text-muted-foreground">{selectedCard.subtitle}</Text>
            <Text variant="caption" className="text-muted-foreground">
              Value:
              {' '}
              {selectedCard.value}
            </Text>
          </View>
        )}
      </BottomSheet>
    </>
  );
}

export { CardsDemo };
