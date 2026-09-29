import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import * as React from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_PRESS } from '@/config/motion';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { Text } from './text';

const RadioGroupValueContext = React.createContext<string | undefined>(undefined);

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

function RadioGroup({ value, onValueChange, disabled, className, children }: RadioGroupProps) {
  return (
    <RadioGroupValueContext value={value}>
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn('gap-3', className)}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupValueContext>
  );
}

type RadioGroupItemProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);

function RadioGroupItem({ value, label, disabled }: RadioGroupItemProps) {
  const groupValue = React.use(RadioGroupValueContext);
  const checked = groupValue === value;
  const primaryHex = usePrimaryHex();
  const colors = useThemeColors();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(checked ? 1 : 0, SPRING_PRESS));
  }, [checked, progress]);

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, primaryHex]),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scaleX: interpolate(progress.value, [0, 0.5, 1], [0.2, 1.5, 1]) },
      { scaleY: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.8, 1]) },
    ],
  }));

  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className="flex-row items-center gap-3 py-1"
    >
      <AnimatedView
        style={ringStyle}
        className="border-muted-foreground/30 size-5 items-center justify-center rounded-full border"
      >
        <AnimatedView style={dotStyle} className="bg-primary size-3 rounded-full" />
      </AnimatedView>
      <Text className="text-foreground text-base">{label}</Text>
    </RadioGroupPrimitive.Item>
  );
}

export type { RadioGroupItemProps, RadioGroupProps };
export { RadioGroup, RadioGroupItem };
