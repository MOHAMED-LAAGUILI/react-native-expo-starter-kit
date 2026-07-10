import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useOnboardingStore } from '@/store';

const ANIMATIONS: Record<string, unknown> = {
  hello: require('@assets/lottie/hello.json'),
  people_reading_news_on_phone: require('@assets/lottie/people_reading_news_on_phone.json'),
  welcome: require('@assets/lottie/welcome.json'),
};
type Slide = {
  title: string;
  description: string;
  animation: string;
};

const SLIDES: Slide[] = [
  {
    animation: 'welcome',
    description: 'A production-ready React Native starter with Expo Router, Tailwind v4, Zustand, and more.',
    title: 'Welcome',
  },
  {
    animation: 'people_reading_news_on_phone',
    description: 'Navigation, theming, i18n, API client, forms, and reusable UI components out of the box.',
    title: 'Features',
  },
  {
    animation: 'hello',
    description: 'Tap below to start building your app. You can revisit settings anytime.',
    title: 'Get Started',
  },
];

function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const progress = useSharedValue(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLast = activeIndex === SLIDES.length - 1;
  const complete = useOnboardingStore((s: { complete: any }) => s.complete);

  function completeOnboarding() {
    complete();
    router.replace('/(auth)/login');
  }

  function onNext() {
    if (isLast) {
      completeOnboarding();
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 pt-20">
        <Carousel
          data={SLIDES}
          width={width}
          height={400}
          pagingEnabled
          loop={false}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          onSnapToItem={(index) => {
            progress.value = index;
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <View className="flex-1 items-center justify-center px-10">
              <View className="mb-8 size-48 items-center justify-center">
                <LottieView
                  source={ANIMATIONS[item.animation]}
                  autoPlay
                  loop
                  style={{ height: '100%', width: '100%' }}
                />
              </View>
              <Text
                variant="h2"
                className="mb-3 text-center"
              >
                {item.title}
              </Text>
              <Text
                variant="body"
                className="text-center leading-6 text-muted-foreground"
              >
                {item.description}
              </Text>
            </View>
          )}
        />
      </View>

      <View
        className="gap-6 px-6 pb-8"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Pagination.Basic
          data={SLIDES}
          progress={progress}
          size={8}
          dotStyle={{
            backgroundColor: '#9CA3AF',
            borderRadius: 4,
            height: 8,
            opacity: 0.3,
            width: 8,
          }}
          activeDotStyle={{
            backgroundColor: '#000000',
            borderRadius: 4,
            height: 8,
            width: 24,
          }}
          containerStyle={{ gap: 6 }}
        />
        <View className="gap-3">
          {isLast && (
            <Button
              title="Get Started"
              onPress={onNext}
            />
          )}
          {!isLast && (
            <Button
              title="Skip"
              variant="outline"
              onPress={completeOnboarding}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export { OnboardingScreen };
