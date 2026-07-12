import type { PublicPost as Post } from '@/api/types';
import { Image, View } from 'react-native';
import { Text } from '@/components/ui';

function PostHero({ post }: { post: Post }) {
  return (
    <Image
      source={{ uri: post.imageUrl }}
      className="h-56 w-full"
      resizeMode="cover"
    />
  );
}

function PostHeader({ post }: { post: Post }) {
  return (
    <View className="gap-1">
      <Text
        variant="caption"
        className="text-muted-foreground"
      >
        {`Post #${post.id} — User #${post.userId}`}
      </Text>
      <Text variant="h2">{post.title}</Text>
    </View>
  );
}

function PostBody({ post }: { post: Post }) {
  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <Text
        variant="body"
        className="leading-6"
      >
        {post.body}
      </Text>
    </View>
  );
}

export { PostBody, PostHeader, PostHero };
