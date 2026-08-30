import * as SwitchPrimitives from '@rn-primitives/switch';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
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

type SwitchSize = 'sm' | 'md' | 'lg';
type SwitchVariant = 'default' | 'liquid-glass' | 'square' | 'gooey';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: SwitchVariant;
  size?: SwitchSize;
  className?: string;
};

type GooeySizeConfig = {
  trackH: number;
  trackW: number;
  knobH: number;
  knobW: number;
  pad: number;
  travel: number;
};

const GOOEY_SIZES: Record<SwitchSize, GooeySizeConfig> = {
  sm: { trackH: 26, trackW: 62, knobH: 20, knobW: 32, pad: 3, travel: 24 },
  md: { trackH: 32, trackW: 76, knobH: 24, knobW: 40, pad: 4, travel: 28 },
  lg: { trackH: 38, trackW: 92, knobH: 28, knobW: 48, pad: 5, travel: 34 },
};

const THUMB_TRANSLATE = 20;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GooeySwitch({
  checked,
  onCheckedChange,
  disabled,
  size = 'md',
  className,
}: Pick<SwitchProps, 'checked' | 'onCheckedChange' | 'disabled' | 'size' | 'className'>) {
  const primaryHex = usePrimaryHex();
  const colors = useThemeColors();
  const config = GOOEY_SIZES[size];
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(checked ? 1 : 0, SPRING_PRESS));
  }, [checked, progress]);

  const knobStyle = useAnimatedStyle(
    () => {
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [0, config.travel],
        Extrapolation.CLAMP,
      );
      const scaleX = interpolate(progress.value, [0, 0.5, 1], [1, 1.4, 1]);
      const scaleY = interpolate(progress.value, [0, 0.5, 1], [1, 0.85, 1]);

      return {
        transform: [{ translateX }, { scaleX }, { scaleY }],
      };
    },
    [size],
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, primaryHex],
    ),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn(
        'shrink-0 justify-center rounded-full',
        disabled && 'opacity-50',
        className,
      )}
      style={[
        trackStyle,
        { height: config.trackH, width: config.trackW, padding: config.pad },
      ]}
    >
      <AnimatedView
        style={[
          knobStyle,
          {
            backgroundColor: colors.card,
            height: config.knobH,
            width: config.knobW,
          },
        ]}
        className="rounded-full shadow-sm"
      />
    </AnimatedPressable>
  );
}

function AnimatedThumb({
  checked,
  variant,
}: {
  checked: boolean;
  variant: Exclude<SwitchVariant, 'gooey'>;
}) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(checked ? 1 : 0, SPRING_PRESS));
  }, [checked, progress]);

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, THUMB_TRANSLATE],
      Extrapolation.CLAMP,
    );
    const scaleX = interpolate(progress.value, [0, 0.5, 1], [1, 1.4, 1]);
    const scaleY = interpolate(progress.value, [0, 0.5, 1], [1, 0.82, 1]);

    return {
      transform: [{ translateX }, { scaleX }, { scaleY }],
    };
  });

  return (
    <AnimatedView
      style={thumbStyle}
      className={cn(
        'size-5 bg-background shadow-sm',
        variant === 'default' && 'rounded-full',
        variant === 'liquid-glass' && [
          'rounded-full bg-white/90',
          'shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.25)]',
        ],
        variant === 'square' && 'rounded-none',
      )}
    />
  );
}

function Switch({
  checked,
  onCheckedChange,
  disabled,
  variant = 'default',
  size = 'md',
  className,
}: SwitchProps) {
  if (variant === 'gooey') {
    return (
      <GooeySwitch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        className={className}
      />
    );
  }

  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'h-6 w-11 flex-row items-center',
        variant === 'square' ? 'rounded-none border-2 px-0' : 'rounded-full px-0.5',
        variant === 'default' && (checked ? 'bg-primary' : 'bg-muted-foreground/30'),
        variant === 'liquid-glass' && [
          checked
            ? 'bg-primary/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.18),0_3px_10px_rgba(0,0,0,0.08)]'
            : 'bg-muted-foreground/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.14)]',
        ],
        variant === 'square' && [
          checked ? 'border-primary bg-primary' : 'border-primary/40 bg-primary/10 dark:border-primary/60 dark:bg-primary/20',
        ],
        disabled && 'opacity-50',
        className,
      )}
    >
      {variant === 'liquid-glass' && (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-white/15"
        />
      )}
      <AnimatedThumb checked={checked} variant={variant} />
    </SwitchPrimitives.Root>
  );
}

export type { SwitchProps, SwitchSize, SwitchVariant };
export { Switch };
