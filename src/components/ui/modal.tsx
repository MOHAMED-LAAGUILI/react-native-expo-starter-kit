import { X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, Modal as RNModal, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';

type ModalVariant = 'bottom-sheet' | 'centered' | 'centered-action';

type ModalAction = {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
  onPress: () => void;
};

type ModalProps = {
  isVisible: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: ModalAction[];
  children?: React.ReactNode;
  className?: string;
};

function Modal({ isVisible, onClose, variant = 'bottom-sheet', title, description, icon, actions, children, className }: ModalProps) {
  const { text } = useThemeColors();
  const [show, setShow] = React.useState(isVisible);
  const [prevVisible, setPrevVisible] = React.useState(isVisible);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(300);
  const scale = useSharedValue(0.95);
  const isBottomSheet = variant === 'bottom-sheet';
  const isCentered = variant === 'centered' || variant === 'centered-action';

  if (isVisible && !prevVisible) {
    setShow(true);
  }
  if (isVisible !== prevVisible) {
    setPrevVisible(isVisible);
  }

  React.useEffect(() => {
    if (show) {
      opacity.set(withTiming(1, { duration: 250 }));
      if (isBottomSheet) {
        translateY.set(withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }));
      }
      else {
        scale.set(withTiming(1, { duration: 250, easing: Easing.out(Easing.back(1.4)) }));
      }
    }
  }, [show, isBottomSheet, opacity, translateY, scale]);

  const hide = () => {
    setShow(false);
    onClose();
  };

  const animateOut = () => {
    'worklet';
    opacity.set(withTiming(0, { duration: 200 }));
    if (isBottomSheet) {
      translateY.set(withTiming(300, { duration: 200 }, (finished) => {
        if (finished)
          runOnJS(hide)();
      }));
    }
    else {
      scale.set(withTiming(0.95, { duration: 200 }, (finished) => {
        if (finished)
          runOnJS(hide)();
      }));
    }
  };

  const handleClose = () => animateOut();

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const sheetTranslateStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const sheetScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  if (!show)
    return null;

  return (
    <RNModal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={backdropStyle}
        className={cn(
          'flex-1 bg-black/50',
          isCentered ? 'items-center justify-center px-8' : 'justify-end',
        )}
      >
        <Pressable className="absolute inset-0" onPress={handleClose} />

        {isBottomSheet && (
          <BottomSheetBody
            title={title}
            className={className}
            onClose={handleClose}
            text={text}
            sheetTranslateStyle={sheetTranslateStyle}
          >
            {children}
          </BottomSheetBody>
        )}

        {isCentered && (
          <CenteredBody
            title={title}
            description={description}
            icon={icon}
            actions={variant === 'centered-action' ? actions : undefined}
            className={className}
            onClose={handleClose}
            text={text}
            sheetScaleStyle={sheetScaleStyle}
          >
            {children}
          </CenteredBody>
        )}
      </Animated.View>
    </RNModal>
  );
}

function BottomSheetBody({ title, className, onClose, text, sheetTranslateStyle, children }: {
  title?: string;
  className?: string;
  onClose: () => void;
  text: string;
  sheetTranslateStyle: any;
  children: React.ReactNode;
}) {
  return (
    <Animated.View style={sheetTranslateStyle} className={cn('rounded-t-3xl bg-background p-6', className)}>
      {title && (
        <View className="mb-4 flex-row items-center justify-between">
          <Text variant="h3">{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={20} color={text} />
          </Pressable>
        </View>
      )}
      {children}
    </Animated.View>
  );
}

function CenteredBody({ title, description, icon, actions, className, onClose, text, sheetScaleStyle, children }: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: ModalAction[];
  className?: string;
  onClose: () => void;
  text: string;
  sheetScaleStyle: any;
  children: React.ReactNode;
}) {
  return (
    <Animated.View style={sheetScaleStyle} className={cn('w-full max-w-sm rounded-2xl bg-background p-6', className)}>
      <View className="mb-2 items-end">
        <Pressable onPress={onClose} hitSlop={8}>
          <X size={20} color={text} />
        </Pressable>
      </View>

      {icon && (
        <View className="mb-4 items-center">
          {icon}
        </View>
      )}

      {title && (
        <Text variant="h3" className="mb-2 text-center">{title}</Text>
      )}

      {description && (
        <Text variant="body" className="mb-6 text-center text-muted-foreground">{description}</Text>
      )}

      {children}

      {actions && (
        <View className="mt-6 gap-3">
          {actions.map(action => (
            <Button
              key={action.label}
              title={action.label}
              variant={action.variant || 'primary'}
              leftIcon={action.icon ? () => action.icon : undefined}
              onPress={() => {
                action.onPress();
                onClose();
              }}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export type { ModalAction, ModalProps, ModalVariant };
export { Modal };
