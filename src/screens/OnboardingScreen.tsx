import * as React from "react";
import { FlatList, type ListRenderItemInfo, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { StorageService } from "@/storage";
import { STORAGE_KEYS } from "@/config/constants";

interface Slide {
  title: string;
  description: string;
  emoji: string;
}

const SLIDES: Slide[] = [
  {
    title: "Welcome",
    description: "A production-ready React Native starter with Expo Router, Tailwind v4, Zustand, and more.",
    emoji: "🚀",
  },
  {
    title: "Features",
    description: "Navigation, theming, i18n, API client, forms, and reusable UI components out of the box.",
    emoji: "⚡",
  },
  {
    title: "Get Started",
    description: "Tap below to start building your app. You can revisit settings anytime.",
    emoji: "🎯",
  },
];

function SlideItem({ item, isActive }: { item: Slide; isActive: boolean }) {
  const { width } = useWindowDimensions();
  return (
    <View className="items-center justify-center px-10" style={{ width }}>
      <View className="w-24 h-24 rounded-2xl bg-primary/10 items-center justify-center mb-8">
        <Text className="text-5xl">{item.emoji}</Text>
      </View>
      <Text variant="h2" className="text-center mb-3">{item.title}</Text>
      <Text variant="body" className="text-muted-foreground text-center leading-6">
        {item.description}
      </Text>
    </View>
  );
}

function Dots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View className="flex-row gap-2 justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={`rounded-full ${i === activeIndex ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"}`}
        />
      ))}
    </View>
  );
}

function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLast = activeIndex === SLIDES.length - 1;

  function onNext() {
    if (isLast) {
      completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }

  function onSkip() {
    completeOnboarding();
  }

  function completeOnboarding() {
    StorageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 pt-20">
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          renderItem={({ item }: ListRenderItemInfo<Slide>) => (
            <SlideItem item={item} isActive={item === SLIDES[activeIndex]} />
          )}
          keyExtractor={(_, i) => String(i)}
        />
      </View>

      <View className="px-6 pb-8 gap-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Dots count={SLIDES.length} activeIndex={activeIndex} />
        <View className="gap-3">
          <Button title={isLast ? "Get Started" : "Next"} onPress={onNext} />
          {!isLast && (
            <Button title="Skip" variant="ghost" onPress={onSkip} />
          )}
        </View>
      </View>
    </View>
  );
}

export { OnboardingScreen };
