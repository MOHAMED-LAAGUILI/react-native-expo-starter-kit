import type { LucideIcon } from 'lucide-react-native';
import type { GestureResponderEvent, LayoutChangeEvent, PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SPRING_PRESS } from '@/config/motion';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { GlassView } from './glass-view';
import { Icon } from './icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'primary-gradient' | 'shadcn' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonEffect = 'ripple' | 'gooey' | 'both';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  effect?: ButtonEffect;
  loading?: boolean;
  title: string;
  iconOnly?: boolean;
  leftIcon?: (color: string) => React.ReactNode;
  rightIcon?: (color: string) => React.ReactNode;
  leftIconComponent?: LucideIcon;
  rightIconComponent?: LucideIcon;
} & PressableProps;

type ButtonContentProps = {
  size: ButtonSize;
  loading: boolean;
  title: string;
  iconOnly: boolean;
  iconColor: string;
  iconClassName: string;
  textClass: string;
  leftIcon?: (color: string) => React.ReactNode;
  rightIcon?: (color: string) => React.ReactNode;
  leftIconComponent?: LucideIcon;
  rightIconComponent?: LucideIcon;
};

const SHADOW_COLORS: Partial<Record<ButtonVariant, string>> = {
  destructive: '#ef4444',
  success: '#16a34a',
};

const BG_CLASS: Record<ButtonVariant, string> = {
  'primary': 'bg-primary active:bg-primary/90',
  'primary-gradient': 'bg-transparent',
  'secondary': 'bg-primary/10 active:bg-primary/20',
  'outline': 'border border-primary bg-background active:bg-primary/10',
  'ghost': 'active:bg-accent',
  'destructive': 'bg-destructive active:bg-destructive/90',
  'success': 'bg-green-600 active:bg-green-700',
  'shadcn': 'bg-foreground active:bg-foreground/90',
  'glass': 'bg-transparent',
};

const TEXT_CLASS: Record<ButtonVariant, string> = {
  'primary': 'text-white!',
  'primary-gradient': 'text-white',
  'secondary': 'text-primary',
  'outline': 'text-primary',
  'ghost': 'text-foreground',
  'destructive': 'text-destructive-foreground',
  'success': 'text-white',
  'shadcn': 'text-background',
  'glass': 'text-foreground',
};

const ICON_CLASS: Record<ButtonVariant, string> = {
  'primary': 'text-primary-foreground',
  'primary-gradient': 'text-white',
  'secondary': 'text-primary',
  'outline': 'text-primary',
  'ghost': 'text-foreground',
  'destructive': 'text-destructive-foreground',
  'success': 'text-white',
  'shadcn': 'text-background',
  'glass': 'text-foreground',
};

const AnimatedView = Animated.createAnimatedComponent(View);

function GradientBackground({
  variant,
  primaryHex,
}: {
  variant: string;
  primaryHex: string;
}) {
  if (variant !== 'primary-gradient')
    return null;
  return (
    <LinearGradient
      colors={[primaryHex, `${primaryHex}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
    />
  );
}

function ButtonContent({
  size,
  loading,
  title,
  iconOnly,
  iconColor,
  iconClassName,
  textClass,
  leftIcon,
  rightIcon,
  leftIconComponent,
  rightIconComponent,
}: ButtonContentProps) {
  if (loading) {
    return <ActivityIndicator size="small" color={iconColor} />;
  }

  if (iconOnly) {
    return leftIconComponent
      ? <Icon as={leftIconComponent} className={iconClassName} color={iconColor} />
      : leftIcon?.(iconColor);
  }

  return (
    <>
      {leftIconComponent
        ? <Icon as={leftIconComponent} className={iconClassName} color={iconColor} />
        : leftIcon?.(iconColor)}
      <Text
        className={cn(
          'font-semibold',
          textClass,
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
        )}
      >
        {title}
      </Text>
      {rightIconComponent
        ? <Icon as={rightIconComponent} className={iconClassName} color={iconColor} />
        : rightIcon?.(iconColor)}
    </>
  );
}

function stripStaticBorder(classes: string) {
  return classes
    .split(' ')
    .filter(token => token !== 'border' && token !== 'border-primary')
    .join(' ');
}

function useButtonEffects(effect: ButtonEffect | undefined) {
  const gooeyProgress = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const containerSize = useSharedValue({ width: 0, height: 0 });

  const hasGooey = effect === 'gooey' || effect === 'both';
  const hasRipple = effect === 'ripple' || effect === 'both';

  const gooeyStyle = useAnimatedStyle(() => {
    if (!hasGooey)
      return {};
    return {
      transform: [
        { scaleX: interpolate(gooeyProgress.value, [0, 0.5, 1], [1, 1.06, 1]) },
        { scaleY: interpolate(gooeyProgress.value, [0, 0.5, 1], [1, 0.96, 1]) },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(gooeyProgress.value, [0, 1], [1, 0.97]) }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: rippleX.value,
    top: rippleY.value,
    width: 160,
    height: 160,
    marginLeft: -80,
    marginTop: -80,
    borderRadius: 80,
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const pressIn = (event: GestureResponderEvent) => {
    if (hasGooey) {
      gooeyProgress.set(withSpring(1, SPRING_PRESS));
    }
    if (hasRipple) {
      rippleX.set(event.nativeEvent.locationX);
      rippleY.set(event.nativeEvent.locationY);
      const { width, height } = containerSize.get();
      const diagonal = Math.hypot(width, height) || 120;
      const target = Math.max(diagonal / 80, 0.2);
      rippleScale.set(0.01);
      rippleOpacity.set(0);
      rippleScale.set(withTiming(target, { duration: 750, easing: Easing.out(Easing.cubic) }));
      rippleOpacity.set(withSequence(
        withTiming(0.3, { duration: 150 }),
        withDelay(450, withTiming(0, { duration: 500 })),
      ));
    }
  };

  const pressOut = () => {
    if (hasGooey) {
      gooeyProgress.set(withSpring(0, SPRING_PRESS));
    }
    if (hasRipple) {
      rippleOpacity.set(withTiming(0, { duration: 200 }));
    }
  };

  const layout = (event: LayoutChangeEvent) => {
    if (!hasRipple)
      return;
    containerSize.set({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  return { hasGooey, hasRipple, gooeyStyle, contentStyle, rippleStyle, pressIn, pressOut, layout };
}

function resolveButtonStyles({
  variant,
  disabled,
  primaryHex,
  background,
  isDark,
}: {
  variant: ButtonVariant;
  disabled: boolean;
  primaryHex: string;
  background: string;
  isDark: boolean;
}) {
  const isLightStyle = variant === 'primary' || variant === 'primary-gradient' || variant === 'destructive' || variant === 'success';

  const shadowColor = variant === 'primary' || variant === 'primary-gradient' ? primaryHex : SHADOW_COLORS[variant];

  const shadowStyle = !disabled && shadowColor
    ? {
        elevation: 6,
        shadowColor,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      }
    : undefined;

  const iconColor = variant === 'shadcn'
    ? background
    : isLightStyle
      ? '#fff'
      : variant === 'secondary' || variant === 'outline'
        ? primaryHex
        : isDark
          ? '#fff'
          : '#000';

  return { isLightStyle, shadowStyle, iconColor };
}

function ButtonSurface({ variant, children }: { variant: ButtonVariant; children: React.ReactNode }) {
  if (variant !== 'glass') {
    return <>{children}</>;
  }
  // Native BlurViews can paint over siblings; z-10 forces the label's draw
  // order above the blur while keeping it in flow (button width = content).
  return (
    <>
      <GlassView pointerEvents="none" intensity="strong" className="absolute inset-0 rounded-lg" />
      <View className="z-10">{children}</View>
    </>
  );
}

function Button({
  variant = 'primary',
  size = 'md',
  effect,
  loading = false,
  title,
  iconOnly = false,
  leftIcon,
  rightIcon,
  leftIconComponent,
  rightIconComponent,
  disabled,
  className,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const primaryHex = usePrimaryHex();
  const { background, isDark } = useThemeColors();
  const { hasGooey, hasRipple, gooeyStyle, contentStyle, rippleStyle, pressIn, pressOut, layout } = useButtonEffects(effect);
  const { isLightStyle, shadowStyle, iconColor } = resolveButtonStyles({ variant, disabled: disabled ?? false, primaryHex, background, isDark });

  const iconClassName = cn(
    size === 'sm' && 'size-4',
    size !== 'sm' && 'size-5',
    ICON_CLASS[variant],
  );

  const bgClass = hasGooey ? stripStaticBorder(BG_CLASS[variant]) : BG_CLASS[variant];
  const textClass = TEXT_CLASS[variant];
  const rippleColor = isLightStyle ? 'rgba(255,255,255,0.5)' : `${primaryHex}33`;

  const handlePressIn = (event: GestureResponderEvent) => {
    setPressed(true);
    pressIn(event);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    pressOut();
    onPressOut?.(event);
  };

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg',
        size === 'sm' && (iconOnly ? 'size-9 p-0' : 'h-9 px-3'),
        size === 'md' && (iconOnly ? 'size-11 p-0' : 'h-11 px-6'),
        size === 'lg' && (iconOnly ? 'size-12 p-0' : 'h-12 px-8'),
        bgClass,
        disabled && 'opacity-50',
        pressed && !disabled && 'opacity-80',
        className,
      )}
      style={shadowStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={hasRipple ? layout : undefined}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      <GradientBackground variant={variant} primaryHex={primaryHex} />
      {hasGooey && (
        <AnimatedView
          pointerEvents="none"
          style={[gooeyStyle, { borderColor: primaryHex }]}
          className="absolute inset-0 rounded-lg border-2"
        />
      )}
      {hasRipple && (
        <View pointerEvents="none" className="absolute inset-0 overflow-hidden rounded-lg">
          <AnimatedView style={[rippleStyle, { backgroundColor: rippleColor }]} />
        </View>
      )}
      <ButtonSurface variant={variant}>
        <AnimatedView
          style={hasGooey ? contentStyle : undefined}
          className="flex-row items-center justify-center gap-2"
        >
          <ButtonContent
            size={size}
            loading={loading}
            title={title}
            iconOnly={iconOnly}
            iconColor={iconColor}
            iconClassName={iconClassName}
            textClass={textClass}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            leftIconComponent={leftIconComponent}
            rightIconComponent={rightIconComponent}
          />
        </AnimatedView>
      </ButtonSurface>
    </Pressable>
  );
}

export type { ButtonEffect, ButtonProps, ButtonSize, ButtonVariant };
export { Button };
