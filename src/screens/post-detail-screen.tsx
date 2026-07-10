import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Image, ScrollView, View } from 'react-native';
import { usePublicPost } from '@/api/hooks/use-public-posts';
import { Text } from '@/components/ui';
import { Button } from '@/components/ui/button';

function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = usePublicPost(postId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LottieView
          source={require('@assets/lottie/loading_animation_blue.json')}
          autoPlay
          loop
          style={{ height: 70, width: 70 }}
        />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text
          variant="body"
          className="mb-4 text-center text-destructive"
        >
          Failed to load post.
        </Text>
        <Button
          title="Go back"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <Image
        source={{ uri: post.imageUrl }}
        className="h-56 w-full"
        resizeMode="cover"
      />
      <View className="gap-4 p-6">
        <View className="gap-1">
          <Text
            variant="caption"
            className="text-muted-foreground"
          >
            Post #
            {post.id}
            {' '}
            — User #
            {post.userId}
          </Text>
          <Text variant="h2">{post.title}</Text>
        </View>

        <View className="rounded-xl border border-border bg-card p-5">
          <Text
            variant="body"
            className="leading-6"
          >
            {post.body}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Button
            title="Back to search"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export { PostDetailScreen };
