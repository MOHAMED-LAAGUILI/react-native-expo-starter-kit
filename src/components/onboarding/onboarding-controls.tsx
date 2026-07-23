import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type OnboardingControlsProps = {
  currentStep: number;
  steps: { image: any; title: string; description: string }[];
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
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <View className="flex-row items-center justify-between px-6 pb-6">
      <Pressable
        onPress={onBack}
        disabled={isFirst}
        className="bg-muted size-12 items-center justify-center rounded-full"
        style={{ opacity: isFirst ? 0.3 : 1 }}
      >
        <ArrowLeft size={20} color={primaryHex} />
      </Pressable>

      <Pressable
        onPress={isLast ? (onComplete ?? (() => {})) : onSkip}
        disabled={isLast}
        className="px-4 py-2"
        style={{ opacity: isLast ? 0.3 : 1 }}
      >
        <Text className="text-muted-foreground text-sm font-semibold">SKIP</Text>
      </Pressable>

      <Pressable
        onPress={isLast ? (onComplete ?? (() => {})) : onNext}
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
