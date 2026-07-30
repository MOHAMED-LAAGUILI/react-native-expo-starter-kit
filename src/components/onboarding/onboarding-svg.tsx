import { View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { OnboardingIllustrations } from './onboarding-illustrations';

type Step = {
  name: 'code-thinking' | 'join-us' | 'meet-the-team';
  title: string;
  description: string;
};

type OnboardingSVGProps = {
  currentStep: number;
  direction: 'forward' | 'backward';
  steps: readonly Step[];
};

export function OnboardingSVG({ currentStep, direction, steps }: OnboardingSVGProps) {
  const primaryHex = usePrimaryHex();
  const { text } = useThemeColors();
  const step = steps[currentStep];
  const animation = direction === 'forward' ? FadeInRight.duration(350) : FadeInLeft.duration(350);

  return (
    <View className="h-[50%] w-full items-center justify-center pt-4">
      <Animated.View entering={animation} key={`image-${currentStep}`} className="size-[260px]">
        <OnboardingIllustrations name={step.name} primaryColor={primaryHex} fgColor={text} />
      </Animated.View>
    </View>
  );
}
