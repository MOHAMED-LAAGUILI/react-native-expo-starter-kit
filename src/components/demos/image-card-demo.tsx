import type { ListRenderItem } from 'react-native';
import type { CardData } from '@/data/cards';
import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { BottomSheet, Image, Text } from '@/components/ui';
import { HORIZONTAL_CARDS, VERTICAL_CARDS } from '@/data/cards';
import { cn } from '@/utils/cn';

type ImageCardProps = {
  card: CardData;
  /** Stable callback shared by every row; the card passes itself back. */
  onSelect?: (card: CardData) => void;
};

function ImageCard({ card, onSelect }: ImageCardProps) {
  const { title, subtitle, imageUrl, orientation } = card;
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
        onPress={() => onSelect?.(card)}
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

  const renderVerticalCard: ListRenderItem<CardData> = ({ item }) => (
    <ImageCard card={item} onSelect={handleSelect} />
  );

  return (
    <>
      <View className="gap-6">
        <View>
          <Text variant="h3" className="mb-3">Vertical Cards</Text>
          {/* FlatList mounts only the cards near the viewport (ScrollView + map mounts all). */}
          <FlatList
            horizontal
            data={VERTICAL_CARDS}
            keyExtractor={card => card.title}
            renderItem={renderVerticalCard}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          />
        </View>

        <View>
          <Text variant="h3" className="mb-3">Horizontal Cards</Text>
          <View className="gap-3">
            {HORIZONTAL_CARDS.map(card => (
              <ImageCard key={card.title} card={card} onSelect={handleSelect} />
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
