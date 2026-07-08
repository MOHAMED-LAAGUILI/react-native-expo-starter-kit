import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import * as React from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { usePublicPost } from "@/api/hooks/usePublicPosts";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = usePublicPost(postId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LottieView
          source={require("@assets/lottie/Loading animation blue.json")}
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
          className="text-destructive text-center mb-4"
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
        className="w-full h-56"
        resizeMode="cover"
      />
      <View className="p-6 gap-4">
        <View className="gap-1">
          <Text
            variant="caption"
            className="text-muted-foreground"
          >
            Post #{post.id} — User #{post.userId}
          </Text>
          <Text variant="h2">{post.title}</Text>
        </View>

        <View className="bg-card p-5 rounded-xl border border-border">
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
