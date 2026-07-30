import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../ui/text';

type PostCardProps = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  onPress: (id: number) => void;
};

export function PostCard({ id, title, body, imageUrl, onPress }: PostCardProps) {
  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  return (

    <Pressable onPress={handlePress} className="overflow-hidden rounded-xl border border-border bg-card">
      <Image
        source={{ uri: imageUrl }}
        className="h-40 w-full"
        contentFit="cover"
        style={{ height: 160, width: '100%' }}
      />
      <View className="p-4">
        <Text
          variant="label"
          className="mb-1 text-muted-foreground"
        >
          Post #
          {id}
        </Text>
        <Text
          variant="body"
          className="mb-1 font-semibold"
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          className="text-muted-foreground"
          numberOfLines={2}
        >
          {body}
        </Text>
      </View>
    </Pressable>
  );
}
