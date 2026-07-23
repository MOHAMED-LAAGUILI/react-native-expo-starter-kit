import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { OnboardingControls } from './onboarding-controls';
import { OnboardingSVG } from './onboarding-svg';

type Step = {
  image: any;
  title: string;
  description: string;
};

type OnboardingScreenProps = {
  steps: Step[];
  onComplete?: () => void;
};

export function OnboardingScreen({ steps, onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipToLastStep = () => {
    setDirection('forward');
    setCurrentStep(steps.length - 1);
  };

  const step = steps[currentStep];
  const animation = direction === 'forward' ? FadeInRight.duration(350) : FadeInLeft.duration(350);

  return (
    <View className="flex-1 bg-background">
      <View className="mx-4 mt-14 flex-1 overflow-hidden rounded-[32px]">
        <View className="flex-1 items-center justify-center px-6">
          <OnboardingSVG
            currentStep={currentStep}
            direction={direction}
            steps={steps}
          />
          <Animated.View entering={animation} key={`text-${currentStep}`} className="items-center">
            <Text className="text-foreground text-center text-2xl font-bold" numberOfLines={2}>
              {step.title}
            </Text>
            <Text className="text-muted-foreground mt-3 text-center text-sm/5" numberOfLines={3}>
              {step.description}
            </Text>
          </Animated.View>
        </View>
        <OnboardingControls
          currentStep={currentStep}
          steps={steps}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          onSkip={skipToLastStep}
          onComplete={onComplete}
        />
      </View>
    </View>
  );
}
