import React from 'react';

import { View } from 'react-native';
import { Card, Text } from '@/components/ui';

type OverviewCardsProps = {
  cards: any[];
};

function OverviewCard({ card }: { card: any }) {
  return (
    <Card
      variant="mini"
      title={card.label}
      value={card.value}
      subtitle={card.subtitle}
      icon={card.icon}
      color={card.accentColor}
    />
  );
}

export function OverviewCards({ cards }: OverviewCardsProps) {
  return (
    <View className="mb-8">
      <Text variant="h4" className="my-4">Overview</Text>
      <View className="gap-3">
        <View className="flex-row gap-3">
          {cards[0] && (
            <View className="flex-1">
              <OverviewCard card={cards[0]} />
            </View>
          )}
          {cards[1] && (
            <View className="flex-1">
              <OverviewCard card={cards[1]} />
            </View>
          )}
        </View>
        {cards[2] && (
          <OverviewCard card={cards[2]} />
        )}
      </View>
    </View>
  );
}
