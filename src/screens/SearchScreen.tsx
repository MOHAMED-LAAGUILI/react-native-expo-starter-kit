import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Search as SearchIcon } from "lucide-react-native";
import * as React from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { usePublicPosts } from "@/api/hooks/usePublicPosts";
import { PostCard } from "@/components/common/PostCard";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

function SearchScreen() {
  const [query, setQuery] = React.useState("");
  const { data: posts, isLoading, error } = usePublicPosts(query);

  return (
    <View className="flex-1 bg-background">
      <View className="p-6 pb-0">
        <Input
          placeholder="Search posts..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          type="search"
        />
        <Text
          variant="caption"
          className="text-muted-foreground mt-2 mb-1"
        >
          {isLoading ? "Loading..." : `${posts?.length ?? 0} posts from jsonplaceholder.typicode.com`}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <LottieView
            source={require("@assets/lottie/Loading animation blue.json")}
            autoPlay
            loop
            style={{ height: 70, width: 70 }}
          />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            variant="body"
            className="text-destructive text-center"
          >
            Failed to load posts. Make sure you are connected to the internet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          contentContainerClassName="px-6 pb-6 gap-2"
          renderItem={({ item }) => (
            <PostCard
              id={item.id}
              title={item.title}
              body={item.body}
              imageUrl={item.imageUrl}
              onPress={() => router.push({ params: { id: String(item.id) }, pathname: "/(app)/post/[id]" })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-12">
              <Text
                variant="body"
                className="text-muted-foreground"
              >
                {query ? "No posts match your search" : "Start typing to search posts"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export { SearchScreen };
