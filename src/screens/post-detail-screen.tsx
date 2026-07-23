import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { usePublicPost } from '@/api/hooks/use-public-posts';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PostHero } from '@/components/post-detail';
import { Button, Text } from '@/components/ui';

function PostDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = usePublicPost(postId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text
          variant="body"
          className="text-destructive mb-4 text-center"
        >
          {t('postDetail.error')}
        </Text>
        <Button
          title={t('common.back')}
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <PostHero post={post} />
    </ScrollView>
  );
}

export { PostDetailScreen };
