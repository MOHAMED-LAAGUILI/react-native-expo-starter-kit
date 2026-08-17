import type { CardData } from '@/data/cards';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { BottomSheet, Image, Text } from '@/components/ui';
import { HORIZONTAL_CARDS, VERTICAL_CARDS } from '@/data/cards';
import { cn } from '@/utils/utils';

type ImageCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  orientation?: 'vertical' | 'horizontal';
  onPress?: () => void;
};

function ImageCard({ title, subtitle, imageUrl, orientation = 'vertical', onPress }: ImageCardProps) {
  const isVertical = orientation === 'vertical';

  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-xl',
        isVertical ? 'h-64 w-48' : 'h-32 w-full',
      )}
    >
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ height: '100%', width: '100%' }}
        className="absolute inset-0 size-full"
        pointerEvents="none"
      />
      <View pointerEvents="none" className="absolute inset-0 bg-black/40" />
      <View
        pointerEvents="none"
        className={cn(
          'absolute p-4',
          isVertical ? 'inset-x-0 bottom-0' : 'inset-0 flex-row items-center justify-between',
        )}
      >
        <View className={isVertical ? '' : 'flex-1'}>
          <Text variant="h4" className="mb-1 text-white">{title}</Text>
          <Text variant="caption" className="text-white/80">{subtitle}</Text>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="absolute inset-0"
      />
    </View>
  );
}

function ImageCardDemo({ onCardSelect }: { onCardSelect?: (card: CardData) => void }) {
  const [selectedCard, setSelectedCard] = React.useState<CardData | null>(null);

  const handleSelect = (card: CardData) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
    else {
      setSelectedCard(card);
    }
  };

  return (
    <>
      <View className="gap-6">
        <View>
          <Text variant="h3" className="mb-3">Vertical Cards</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {VERTICAL_CARDS.map(card => (
              <ImageCard key={card.title} {...card} onPress={() => handleSelect({ ...card })} />
            ))}
          </ScrollView>
        </View>

        <View>
          <Text variant="h3" className="mb-3">Horizontal Cards</Text>
          <View className="gap-3">
            {HORIZONTAL_CARDS.map(card => (
              <ImageCard key={card.title} {...card} onPress={() => handleSelect({ ...card })} />
            ))}
          </View>
        </View>
      </View>

      <BottomSheet
        open={selectedCard !== null}
        onOpenChange={(v) => {
          if (!v)
            setSelectedCard(null);
        }}
        title={selectedCard?.title ?? ''}
      >
        {selectedCard && (
          <>
            <Image
              source={{ uri: selectedCard.imageUrl }}
              className="h-64 w-full"
              contentFit="cover"
              style={{ height: '100%', width: '100%' }}
            />
            <View className="gap-2 p-4">
              <Text variant="h4">{selectedCard.title}</Text>
              <Text variant="body" className="text-muted-foreground">{selectedCard.subtitle}</Text>
              <Text variant="caption" className="text-muted-foreground">
                Orientation:
                {' '}
                {selectedCard.orientation}
              </Text>
            </View>
          </>
        )}
      </BottomSheet>
    </>
  );
}

export { ImageCardDemo };
