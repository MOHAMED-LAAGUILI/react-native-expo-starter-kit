import * as React from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { usePublicPosts } from "@/api/hooks/usePublicPosts";

function SearchScreen() {
  const [query, setQuery] = React.useState("");
  const { data: posts, isLoading, error } = usePublicPosts(query);

  return (
    <View className="flex-1 bg-background">
      <View className="p-6 pb-0">
        <Text variant="h2" className="mb-4">Search</Text>
        <Input
          placeholder="Search posts..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Text className="text-muted-foreground">{'>'}</Text>}
        />
        <Text variant="caption" className="text-muted-foreground mt-2 mb-1">
          {isLoading ? "Loading..." : `${posts?.length ?? 0} posts from jsonplaceholder.typicode.com`}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="body" className="text-destructive text-center">
            Failed to load posts. Make sure you are connected to the internet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          contentContainerClassName="px-6 pb-6 gap-2"
          renderItem={({ item }) => (
            <Pressable className="bg-card p-4 rounded-xl border border-border active:opacity-80">
              <Text variant="label" className="text-muted-foreground mb-1">
                Post #{item.id}
              </Text>
              <Text variant="body" className="font-semibold mb-1">
                {item.title}
              </Text>
              <Text variant="bodySmall" className="text-muted-foreground" numberOfLines={2}>
                {item.body}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-12">
              <Text variant="body" className="text-muted-foreground">
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
