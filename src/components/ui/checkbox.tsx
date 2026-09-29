import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
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
import { Icon } from './icon';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

function Checkbox({ checked, onCheckedChange, disabled, className }: CheckboxProps) {
  const primaryHex = usePrimaryHex();
  const colors = useThemeColors();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(checked ? 1 : 0, SPRING_PRESS));
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.background, primaryHex]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, primaryHex]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scaleX: interpolate(progress.value, [0, 0.5, 1], [0.2, 1.5, 1]) },
      { scaleY: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.8, 1]) },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={12}
      className={cn(
        'size-5 items-center justify-center rounded-sm border',
        disabled && 'opacity-50',
        className,
      )}
      style={boxStyle}
    >
      <AnimatedView style={checkStyle}>
        <Icon as={Check} className="text-primary-foreground size-3.5" />
      </AnimatedView>
    </AnimatedPressable>
  );
}

export type { CheckboxProps };
export { Checkbox };
