import type { OnboardingSlide } from '@/data/onboarding-slides';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ONBOARDING_ANIMATIONS } from '@/data/onboarding-slides';

type OnboardingSlideItemProps = {
  item: OnboardingSlide;
};

function OnboardingSlideItem({ item }: OnboardingSlideItemProps) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View className="mb-8 size-48 items-center justify-center">
        <LottieView
          source={ONBOARDING_ANIMATIONS[item.animation]}
          autoPlay
          loop
          style={{ height: '100%', width: '100%' }}
        />
      </View>
      <Text variant="h2" className="mb-3 text-center">
        {item.title}
      </Text>
      <Text variant="body" className="text-center leading-6 text-muted-foreground">
        {item.description}
      </Text>
    </View>
  );
}

export { OnboardingSlideItem };
export type { OnboardingSlideItemProps };
