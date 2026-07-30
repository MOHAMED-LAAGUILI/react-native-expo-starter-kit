import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui';

function ForgotPasswordLink() {
  const router = useRouter();

  return (
    <Pressable className="items-center py-2" onPress={() => router.push('/forgot-password' as never)}>
      <Text variant="body" className="text-muted-foreground">
        Forgot your password?
        {' '}
        <Text variant="body" className="font-semibold text-primary">
          Reset it
        </Text>
      </Text>
    </Pressable>
  );
}

export { ForgotPasswordLink };
