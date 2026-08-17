import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';
import { createContext, use, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
  View,

} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Button } from './button';
import { Text } from './text';

type SheetSide = 'left' | 'right';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  children: ReactNode;
};

type SheetContentProps = {
  children: ReactNode;
  style?: ViewStyle;
};

type SheetHeaderProps = {
  children: ReactNode;
  style?: ViewStyle;
};

type SheetTitleProps = {
  children: ReactNode;
};

type SheetDescriptionProps = {
  children: ReactNode;
};

type SheetTriggerProps = {
  children: ReactNode;
};

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: SheetSide;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheet() {
  const context = use(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet');
  }
  return context;
}

export function Sheet({
  open,
  onOpenChange,
  side = 'right',
  children,
}: SheetProps) {
  return (
    <SheetContext value={{ open, onOpenChange, side }}>
      {children}
    </SheetContext>
  );
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  const { onOpenChange } = useSheet();

  return (
    <Button
      title={typeof children === 'string' ? children : 'Open'}
      onPress={() => onOpenChange(true)}
      className="rounded-full"
    />
  );
}

function useSheetAnimation({
  open,
  side,
  sheetWidth,
}: {
  open: boolean;
  side: SheetSide;
  sheetWidth: number;
}) {
  const initialPosition = side === 'left' ? -sheetWidth : sheetWidth;
  const translateX = useSharedValue(initialPosition);
  const overlayOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open && !isVisible) {
      translateX.set(side === 'left' ? -sheetWidth : sheetWidth);
    }

    if (open) {
      scheduleOnRN(setIsVisible, true);
      translateX.set(withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      }));
      overlayOpacity.set(withTiming(1, { duration: 300 }));
    }
    else if (isVisible) {
      translateX.set(withTiming(
        initialPosition,
        { duration: 250 },
        (finished) => {
          if (finished) {
            scheduleOnRN(setIsVisible, false);
          }
        },
      ));
      overlayOpacity.set(withTiming(0, { duration: 250 }));
    }
  }, [open, side, sheetWidth, initialPosition, isVisible, overlayOpacity, translateX]);
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(overlayOpacity.value, [0, 1], [0, 0.3]),
  }));

  return { animatedOverlayStyle, animatedSheetStyle, isVisible };
}

export function SheetContent({ children, style }: SheetContentProps) {
  const { open, onOpenChange, side } = useSheet();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { background, icon } = useThemeColors();
  const sheetWidth = Math.min(screenWidth * 0.8, 400);
  const { animatedOverlayStyle, animatedSheetStyle, isVisible }
    = useSheetAnimation({ open, side, sheetWidth });

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!isVisible) {
    return null;
  }

  const innerCornerStyle
    = side === 'left'
      ? { borderTopRightRadius: 24, borderBottomRightRadius: 24 }
      : { borderTopLeftRadius: 24, borderBottomLeftRadius: 24 };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        <Animated.View className="absolute inset-0 bg-black" style={animatedOverlayStyle}>
          <Pressable className="flex-1" onPress={handleClose} accessibilityRole="button" />
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              backgroundColor: background,
              width: sheetWidth,
              [side]: 0,
            },
            innerCornerStyle,
            animatedSheetStyle,
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              },
              android: { elevation: 10 },
            }),
            style,
          ]}
          className={cn(
            'absolute inset-y-0',
            side === 'left' ? 'border-border border-r' : 'border-border border-l',
          )}
        >
          <Pressable
            style={({ pressed }) => [
              {
                top: insets.top + 10,
                [side === 'left' ? 'right' : 'left']: 16,
              },
              pressed && { opacity: 0.2 },
            ]}
            className="absolute z-10 size-8 items-center justify-center rounded-full bg-background"
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={20} color={icon} />
          </Pressable>

          <View className="flex-1">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function SheetHeader({ children, style }: SheetHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="px-6 pb-4" style={[{ paddingTop: insets.top + 50 }, style]}>
      {children}
    </View>
  );
}

export function SheetTitle({ children }: SheetTitleProps) {
  return <Text variant="h2" className="mb-2">{children}</Text>;
}

export function SheetDescription({ children }: SheetDescriptionProps) {
  return <Text variant="bodySmall" className="text-muted-foreground">{children}</Text>;
}
