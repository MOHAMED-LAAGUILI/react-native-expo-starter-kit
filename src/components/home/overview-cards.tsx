import React from 'react';

import { View } from 'react-native';
import { Text } from '@/components/ui';

type OverviewCardsProps = {
  cards: any[];
};

function OverviewCard({ card }: { card: any }) {
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <View
          className="size-2 rounded-full"
          style={{ backgroundColor: card.accentColor }}
        />
        <Text variant="caption" className="text-muted-foreground">
          {card.label}
        </Text>
      </View>
      <Text className="mt-3 text-2xl font-semibold">{card.value}</Text>
      <Text variant="caption" className="mt-1 text-muted-foreground">
        {card.subtitle}
      </Text>
    </View>
  );
}

export function OverviewCards({ cards }: OverviewCardsProps) {
  return (
    <View className="mb-8">
      <Text variant="h4" className="mb-4">Overview</Text>
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
