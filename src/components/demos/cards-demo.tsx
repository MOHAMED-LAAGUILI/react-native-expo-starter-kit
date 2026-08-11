import type { DemoSheetCard } from '@/data/cards';
import { BarChart3, Box, ShoppingCart, TrendingUp, Users, Zap } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { BottomSheet, Card, Text } from '@/components/ui';
import { DEMO_CARDS } from '@/data/cards';

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

      <Text variant="h3" className="mt-6 mb-3">Mini Cards</Text>
      <View className="gap-3">
        <Card
          variant="mini"
          icon={TrendingUp}
          color="#10b981"
          title="Revenue"
          value="$12,450"
          subtitle="+15% from last month"
        />
        <Card
          variant="mini"
          icon={Users}
          color="#3b82f6"
          title="Customers"
          value="892"
          subtitle="+45 new this week"
        />
        <Card
          variant="mini"
          icon={ShoppingCart}
          color="#f59e0b"
          title="Orders"
          value="1,234"
          subtitle="23 pending"
        />

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
