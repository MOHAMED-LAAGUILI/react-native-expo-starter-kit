import { View } from 'react-native';
import { Button } from '@/components/ui';

type OnboardingActionsProps = {
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
};

function OnboardingActions({ isLast, onNext, onSkip }: OnboardingActionsProps) {
  return (
    <View className="gap-3">
      {isLast && (
        <Button title="Get Started" onPress={onNext} />
      )}
      {!isLast && (
        <Button title="Skip" variant="outline" onPress={onSkip} />
      )}
    </View>
  );
}

export { OnboardingActions };
export type { OnboardingActionsProps };
