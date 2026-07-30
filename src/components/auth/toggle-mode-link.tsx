import { Pressable } from 'react-native';
import { Text } from '@/components/ui';

type ToggleModeLinkProps = {
  isLogin: boolean;
  onPress: () => void;
};

function ToggleModeLink({ isLogin, onPress }: ToggleModeLinkProps) {
  return (
    <Pressable className="items-center py-2" onPress={onPress}>
      <Text variant="body" className="text-muted-foreground">
        {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
        <Text variant="body" className="font-semibold text-primary">
          {isLogin ? 'Sign Up' : 'Sign In'}
        </Text>
      </Text>
    </Pressable>
  );
}

export { ToggleModeLink };
export type { ToggleModeLinkProps };
