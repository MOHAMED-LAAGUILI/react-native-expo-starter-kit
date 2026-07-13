import { Image, Pressable, View } from 'react-native';
import { Text } from '../ui';

type PostCardProps = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  onPress: () => void;
};

export function PostCard({ id, title, body, imageUrl, onPress }: PostCardProps) {
  return (
    <Pressable
      className="overflow-hidden rounded-xl border border-border bg-card active:opacity-80"
      onPress={onPress}
    >
      <Image
        source={{ uri: imageUrl }}
        className="h-40 w-full"
        resizeMode="cover"
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
