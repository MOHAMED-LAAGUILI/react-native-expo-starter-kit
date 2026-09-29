import type { Plan } from '@/components/ui/blocks/pricing-section';
import { useState } from 'react';
import { View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, SectionTitle, Skeleton, Text } from '@/components/ui';
import { AdaptiveSlider } from '@/components/ui/adaptive-slider';
import { ViewOnMap } from '@/components/ui/blocks/map-view';
import ChangeablePricingSection from '@/components/ui/blocks/pricing-section';

import { WeightWidget } from '@/components/ui/blocks/weight-widget';
import { TranscribeVoiceMessage } from '@/components/ui/media/transcribe-voice-message';
import { WaveformScrub } from '@/components/ui/media/waveform-scrub';
import { AnimatedNumber } from '@/components/ui/number-flow';
import { useChartReady } from '@/hooks/use-chart-ready';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isIOS } from '@/utils/platform';

const SAMPLE_AUDIO_URL
  = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const demoPlans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for individuals & small teams',
    priceMonthly: '$4.99',
    priceYearly: '$3.99',
    featuresLabel: 'CORE FEATURES:',
    features: [
      { text: 'Up to 10 users', hasInfo: false },
      { text: 'Basic reporting', hasInfo: false },
      { text: 'Standard support', hasInfo: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Best for mid-sized teams',
    priceMonthly: '$9.99',
    priceYearly: '$7.99',
    badge: 'POPULAR',
    featuresLabel: 'EVERYTHING IN PRO, PLUS:',
    features: [
      { text: 'Custom workflows & task statuses', hasInfo: false },
      { text: 'Role-based permissions', hasInfo: false },
      { text: 'Automations', hasInfo: true },
      { text: 'Advanced dashboards', hasInfo: true },
      { text: 'Integrations', hasInfo: true },
      { text: 'Priority support', hasInfo: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description:
      'Best for large organizations & regulated industries',
    priceMonthly: '$39.99',
    priceYearly: '$31.99',
    featuresLabel: 'EVERYTHING IN BUSINESS, PLUS:',
    features: [
      { text: 'Unlimited users', hasInfo: false },
      { text: 'Dedicated success manager', hasInfo: false },
      { text: 'Custom SLAs & advanced security', hasInfo: false },
    ],
  },
];

/**
 * Mounts heavy blocks (WebView map, gesture dial, audio players) after
 * navigation settles, staggered by `order`, showing a skeleton meanwhile —
 * keeps the screen transition at 60fps.
 */
function DeferredBlock({ order, skeletonClassName, children }: {
  order: number;
  skeletonClassName: string;
  children: React.ReactNode;
}) {
  const ready = useChartReady(order);

  if (!ready) {
    return <Skeleton className={skeletonClassName} />;
  }

  return <>{children}</>;
}

function NumberFlowDemo() {
  const { text } = useThemeColors();
  const [price, setPrice] = useState(42.99);

  return (
    <View className="items-start gap-3">
      <AnimatedNumber
        value={price}
        format={{ style: 'currency', currency: 'USD' }}
        style={{ fontSize: 32, color: text, fontWeight: '700' }}
      />
      <Button title="Randomize" size="sm" variant="secondary" onPress={() => setPrice(Math.round((Math.random() * 200 + 1) * 100) / 100)} />
    </View>
  );
}

function SliderDemos() {
  return (
    <View className="gap-6">
      {(['xs', 'sm', 'md', 'lg'] as const).map((s, i) => (
        <View key={s} className="gap-2">
          <Text variant="label" className="text-muted-foreground uppercase">{s}</Text>
          <AdaptiveSlider
            min={100}
            max={800}
            step={50}
            defaultValue={300 + i * 100}
            size={s}
          />
        </View>
      ))}
    </View>
  );
}

function PricingDemo() {
  return (
    <ChangeablePricingSection
      plans={demoPlans}
      defaultPlanId="business"
      onContinue={(planId, cycle) =>
        console.log(`Selected: ${planId}, Cycle: ${cycle}`)}
    />
  );
}

export function BlocksScreen() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState(24);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-6 p-6">
        <Text variant="h2" className="mb-1">Blocks</Text>
        <Text variant="body" className="text-muted-foreground mb-2">
          Ready-made product blocks: animated numbers, sliders, pricing, audio, and more.
        </Text>

        <SectionTitle title="Animated Number" />
        <NumberFlowDemo />

        <SectionTitle title="Adaptive Sliders" />
        <SliderDemos />

        <SectionTitle title="Pricing" />
        <PricingDemo />

        <SectionTitle title="Audio Messages" />
        <DeferredBlock order={0} skeletonClassName="h-20 w-full rounded-2xl">
          <WaveformScrub
            duration={35}
            fileName="Mom.mp3"
            source={SAMPLE_AUDIO_URL}
          />
        </DeferredBlock>

        <DeferredBlock order={1} skeletonClassName="h-28 w-full rounded-2xl">
          <TranscribeVoiceMessage
            duration={5}
            transcription="Hey! Just brewed a fresh cup of coffee. Would you like to have some? I'm sure you'll love this."
            source={SAMPLE_AUDIO_URL}
          />
        </DeferredBlock>

        <SectionTitle title="Weight Dial" />
        <DeferredBlock order={2} skeletonClassName="h-56 w-full rounded-2xl">
          <WeightWidget
            initialValue={weight}
            min={0}
            max={200}
            onChange={val => setWeight(val)}
          />
        </DeferredBlock>

        <SectionTitle title="Map" />
        <DeferredBlock order={3} skeletonClassName="h-24 w-full rounded-2xl">
          <ViewOnMap
            locationName="Big Belly Burger"
            address="75 Charles St, Boston, MA 02114"
          />
        </DeferredBlock>
      </View>
    </ScrollView>
  );
}
