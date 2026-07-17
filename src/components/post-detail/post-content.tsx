import type { PublicPost as Post } from '@/api/types';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Image, Text } from '@/components/ui';

function PostHero({ post }: { post: Post }) {
  return (
    <View>
      <View className="h-87.5">
        <Image
          source={{ uri: post.imageUrl }}
          className="absolute size-full"
          contentFit="cover"
          blurRadius={15}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          className="absolute size-full"
        />
        <View className="absolute inset-x-0 bottom-0 gap-2 p-6 pb-8">
          <Text variant="caption" className="text-white/70">
            {`Post #${post.id} — User #${post.userId}`}
          </Text>
          <Text variant="h2" className="text-white">
            {post.title}
          </Text>
        </View>
      </View>
      <View className="gap-4 p-6">
        <Image
          fallback=""
          source={{ uri: post.imageUrl }}
          className="h-64 w-full rounded-xl"
          contentFit="cover"
        />
        <Text variant="body" className="leading-6">
          {post.body}
        </Text>
      </View>
    </View>
  );
}

export { PostHero };
