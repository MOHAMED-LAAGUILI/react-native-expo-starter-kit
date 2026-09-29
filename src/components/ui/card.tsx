import type { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useGooeyPress } from '@/hooks/use-gooey-press';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { cn } from '@/utils/cn';
import { GlassView } from './glass-view';
import { Text } from './text';

type CardVariant = 'primary' | 'secondary' | 'stats' | 'compact' | 'action' | 'mini' | 'glass';
type CardEffect = 'gooey';

type CardProps = {
  variant?: CardVariant;
  /** Press interaction style. `gooey` squashes the card like a soft blob (needs `onPress`). */
  effect?: CardEffect;
  title?: string;
  value?: string;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardContentProps = Pick<CardProps, 'title' | 'value' | 'subtitle' | 'icon' | 'children'> & {
  variant: CardVariant;
  iconBg: string;
  iconColor: string;
};

type MiniCardProps = Pick<CardProps, 'title' | 'value' | 'subtitle' | 'icon' | 'children'> & {
  accent: string;
};

function MiniCardContent({ title, value, subtitle, icon: Icon, accent, children }: MiniCardProps) {
  return (
    <View className="relative flex-row items-center gap-3 p-3">
      <LinearGradient
        colors={[`${accent}3D`, `${accent}0D`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: -40, left: -40, width: 120, height: 120, borderRadius: 60 }}
      />
      {Icon && <Icon size={20} color={accent} />}
      <View className="flex-1 gap-0.5">
        <Text variant="caption" className="text-muted-foreground">
          {title}
        </Text>
        {value && (
          <Text variant="body" className="text-foreground font-semibold tracking-tight">
            {value}
          </Text>
        )}
        {subtitle && (
          <Text variant="caption" className="text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function CardContent({ variant, title, value, subtitle, icon: Icon, iconBg, iconColor, children }: CardContentProps) {
  const isLightSolid = variant === 'primary';

  return (
    <View className={cn('p-4', variant === 'compact' && 'p-3')}>
      {(title || value || subtitle || Icon) && (
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text
              variant="caption"
              className={cn(isLightSolid ? 'text-white/70' : 'text-muted-foreground')}
            >
              {title}
            </Text>
            {value && (
              <Text
                variant="h2"
                className={cn(
                  'tracking-tight',
                  isLightSolid ? 'text-white' : 'text-foreground',
                  variant === 'compact' && 'text-2xl',
                )}
              >
                {value}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="caption"
                className={cn(isLightSolid ? 'text-white/60' : 'text-muted-foreground')}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {Icon && (
            <View
              className="ml-3 items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, backgroundColor: iconBg }}
            >
              <Icon size={22} color={iconColor} />
            </View>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

function Card({
  variant = 'stats',
  effect,
  title,
  value,
  subtitle,
  icon,
  color,
  className,
  children,
  onPress,
  disabled,
}: CardProps) {
  const primaryHex = usePrimaryHex();
  const gooey = useGooeyPress(effect === 'gooey' && !!onPress && !disabled);
  const accent = color ?? primaryHex;
  const isMini = variant === 'mini';
  const isGlass = variant === 'glass';
  const isLightSolid = variant === 'primary';
  const iconBg = isLightSolid ? 'rgba(255,255,255,0.2)' : `${primaryHex}15`;
  const iconColor = isLightSolid ? '#fff' : primaryHex;

  const content = isMini
    ? (
        <MiniCardContent
          title={title}
          value={value}
          subtitle={subtitle}
          icon={icon}
          accent={accent}
        >
          {children}
        </MiniCardContent>
      )
    : (
        <CardContent
          variant={variant}
          title={title}
          value={value}
          subtitle={subtitle}
          icon={icon}
          iconBg={iconBg}
          iconColor={iconColor}
        >
          {children}
        </CardContent>
      );

  const sharedClassName = cn(
    'border-border overflow-hidden rounded-2xl border',
    isLightSolid && 'border-transparent',
    variant === 'secondary' && 'border-transparent',
    isGlass && 'border-white/20 dark:border-white/10',
    variant !== 'primary' && variant !== 'secondary' && !isGlass && 'bg-card shadow-xs',
    className,
  );
  const solidStyle = isLightSolid ? { backgroundColor: primaryHex } : undefined;
  // Native BlurViews can paint over absolutely-positioned siblings, so glass
  // cards render their content inside the GlassView (children stay above the blur).
  const surface = isGlass
    ? <GlassView bordered={false}>{content}</GlassView>
    : content;

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={gooey.pressIn}
        onPressOut={gooey.pressOut}
        disabled={disabled}
        accessibilityRole="button"
        className={sharedClassName}
        style={[solidStyle, gooey.surfaceStyle]}
      >
        {surface}
      </AnimatedPressable>
    );
  }

  return (
    <View className={sharedClassName} style={solidStyle}>
      {surface}
    </View>
  );
}

export type { CardEffect, CardProps, CardVariant };
export { Card };
