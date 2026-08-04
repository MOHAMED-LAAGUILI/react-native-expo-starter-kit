import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type OnboardingControlsProps = {
  currentStep: number;
  steps: readonly { name: string; title: string; description: string }[];
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onComplete?: () => void;
};

export function OnboardingControls({
  currentStep,
  steps,
  onBack,
  onNext,
  onSkip,
  onComplete,
}: OnboardingControlsProps) {
  const primaryHex = usePrimaryHex();
  const { t } = useTranslation();
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
      <Pressable
        onPress={onBack}
        disabled={isFirst}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        accessibilityState={{ disabled: isFirst }}
        className="size-12 items-center justify-center rounded-full border bg-muted"
        style={{ opacity: isFirst ? 0.3 : 1, borderColor: primaryHex }}
      >
        <ArrowLeft size={20} color={primaryHex} />
      </Pressable>

      <Pressable
        onPress={isLast ? (onComplete ?? (() => {})) : onSkip}
        disabled={isLast}
        accessibilityRole="button"
        accessibilityLabel={isLast ? t('common.finish') : t('common.skip')}
        accessibilityState={{ disabled: isLast }}
        className="px-4 py-2"
        style={{ opacity: isLast ? 0.3 : 1 }}
      >
        <Text className="text-sm font-semibold text-muted-foreground">{isLast ? t('common.finish') : t('common.skip')}</Text>
      </Pressable>

      <Pressable
        onPress={isLast ? (onComplete ?? (() => {})) : onNext}
        accessibilityRole="button"
        accessibilityLabel={isLast ? t('common.finish') : t('common.next')}
        className="size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: primaryHex }}
      >
        {isLast
          ? <LogIn size={20} color="#fff" />
          : <ArrowRight size={20} color="#fff" />}
      </Pressable>
    </View>
  );
}
