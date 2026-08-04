import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image, Text } from '@/components/ui';
import { cn } from '@/utils/utils';

type CardData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  orientation: 'vertical' | 'horizontal';
};

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
    <Pressable
      onPress={onPress}
      className={cn(
        'overflow-hidden rounded-xl',
        isVertical ? 'h-64 w-48' : 'h-32 w-full',
      )}
    >
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ height: '100%', width: '100%' }}
        className="absolute inset-0 size-full"
      />
      <View className="absolute inset-0 bg-black/40" />
      <View className={cn(
        'absolute p-4',
        isVertical ? 'inset-x-0 bottom-0' : 'inset-0 flex-row items-center justify-between',
      )}
      >
        <View className={isVertical ? '' : 'flex-1'}>
          <Text variant="h4" className="mb-1 text-white">{title}</Text>
          <Text variant="caption" className="text-white/80">{subtitle}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const VERTICAL_CARDS: CardData[] = [
  { title: 'Mountain', subtitle: 'Adventure awaits', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop', orientation: 'vertical' },
  { title: 'Ocean', subtitle: 'Deep blue', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop', orientation: 'vertical' },
  { title: 'Forest', subtitle: 'Nature\'s path', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop', orientation: 'vertical' },
];

const HORIZONTAL_CARDS: CardData[] = [
  { title: 'City Lights', subtitle: 'Urban exploration', imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=200&fit=crop', orientation: 'horizontal' },
  { title: 'Sunset', subtitle: 'Golden hour', imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=200&fit=crop', orientation: 'horizontal' },
  { title: 'Desert', subtitle: 'Sand dunes', imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=200&fit=crop', orientation: 'horizontal' },
];

function ImageCardDemo({ onCardSelect }: { onCardSelect?: (card: CardData) => void }) {
  return (
    <View className="gap-6">
      <View>
        <Text variant="h3" className="mb-3">Vertical Cards</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {VERTICAL_CARDS.map(card => (
            <ImageCard key={card.title} {...card} onPress={() => onCardSelect?.({ ...card })} />
          ))}
        </ScrollView>
      </View>

      <View>
        <Text variant="h3" className="mb-3">Horizontal Cards</Text>
        <View className="gap-3">
          {HORIZONTAL_CARDS.map(card => (
            <ImageCard key={card.title} {...card} onPress={() => onCardSelect?.({ ...card })} />
          ))}
        </View>
      </View>
    </View>
  );
}

export type { CardData };
export { ImageCardDemo };
