import type { SharedValue } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, Modal as RNModal, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,

  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIOS } from '@/utils/platform';
import { cn } from '@/utils/utils';
import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

const SPRING_CONFIG = { damping: 20, stiffness: 260, mass: 1 };
const BACKDROP_DURATION = 220;

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

function hapticFeedback(style: 'Soft' | 'Light') {
  if (!isIOS)
    return;
  import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
    impactAsync(ImpactFeedbackStyle[style]).catch(() => {});
  }).catch(() => {});
}

function useModalEntry({ show, isBottomSheet }: { show: boolean; isBottomSheet: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(300);
  const scale = useSharedValue(0.92);

  React.useEffect(() => {
    if (!show)
      return;
    hapticFeedback('Soft');
    opacity.set(withTiming(1, { duration: BACKDROP_DURATION }));
    if (isBottomSheet) {
      translateY.set(withSpring(0, SPRING_CONFIG));
    }
    else {
      scale.set(withSpring(1, { ...SPRING_CONFIG, stiffness: 300 }));
    }
  }, [show, isBottomSheet, opacity, translateY, scale]);

  return { opacity, translateY, scale };
}

function createPanGesture({ isBottomSheet, show, translateY, handleClose }: {
  isBottomSheet: boolean;
  show: boolean;
  translateY: SharedValue<number>;
  handleClose: () => void;
}) {
  return Gesture.Pan()
    .onUpdate(({ translationY }) => {
      if (translationY > 0) {
        translateY.set(translationY);
      }
    })
    .onEnd(({ translationY, velocityY }) => {
      if (translationY > 120 || velocityY > 500) {
        runOnJS(handleClose)();
      }
      else {
        translateY.set(withSpring(0, SPRING_CONFIG));
      }
    })
    .activeOffsetY(10)
    .enabled(isBottomSheet && show);
}

function Modal({ isVisible, onClose, variant = 'bottom-sheet', title, description, icon, actions, children, className }: ModalProps) {
  const insets = useSafeAreaInsets();
  const isBottomSheet = variant === 'bottom-sheet';
  const isCentered = variant === 'centered' || variant === 'centered-action';

  const { opacity, translateY, scale } = useModalEntry({ show: isVisible, isBottomSheet });

  const dismiss = () => {
    onClose();
  };

  const animateOut = () => {
    'worklet';
    opacity.set(withTiming(0, { duration: 180 }));
    if (isBottomSheet) {
      translateY.set(withTiming(300, { duration: 180 }, (finished) => {
        if (finished)
          runOnJS(dismiss)();
      }));
    }
    else {
      scale.set(withTiming(0.92, { duration: 180 }, (finished) => {
        if (finished)
          runOnJS(dismiss)();
      }));
    }
  };

  const handleClose = () => {
    hapticFeedback('Light');
    animateOut();
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const sheetTranslateStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const sheetScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const panGesture = createPanGesture({ isBottomSheet, show: isVisible, translateY, handleClose });

  if (!isVisible)
    return null;

  return (
    <RNModal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={backdropStyle}
        className={cn('flex-1 bg-black/40', isCentered ? 'items-center justify-center px-8' : 'justify-end')}
      >
        <Pressable className="absolute inset-0" onPress={handleClose} />

        {isBottomSheet && (
          <GestureDetector gesture={panGesture}>
            <BottomSheetBody
              title={title}
              className={className}
              onClose={handleClose}
              sheetTranslateStyle={sheetTranslateStyle}
              bottomInset={insets.bottom}
            >
              {children}
            </BottomSheetBody>
          </GestureDetector>
        )}

        {isCentered && (
          <CenteredBody
            title={title}
            description={description}
            icon={icon}
            actions={variant === 'centered-action' ? actions : undefined}
            className={className}
            onClose={handleClose}
            sheetScaleStyle={sheetScaleStyle}
          >
            {children}
          </CenteredBody>
        )}
      </Animated.View>
    </RNModal>
  );
}

const SHEET_MIN_Y = 60;

function BottomSheetBody({ title, className, onClose, sheetTranslateStyle, children, bottomInset }: {
  title?: string;
  className?: string;
  onClose: () => void;
  sheetTranslateStyle: object;
  children: React.ReactNode;
  bottomInset: number;
}) {
  return (
    <Animated.View
      style={[sheetTranslateStyle, { marginTop: SHEET_MIN_Y, marginBottom: bottomInset > 0 ? bottomInset : 0 }]}
      className={cn('rounded-[28px] bg-background p-6', className)}
    >
      <View className="mb-5 items-center">
        <View className="mb-4 h-1 w-9 rounded-full bg-foreground/20" />
        {title && (
          <View className="w-full flex-row items-center justify-between">
            <Text variant="h3">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <View className="size-8 items-center justify-center rounded-full bg-foreground/10">
                <Icon as={X} className="size-4 text-foreground/60" />
              </View>
            </Pressable>
          </View>
        )}
      </View>
      {children}
    </Animated.View>
  );
}

function CenteredBody({ title, description, icon, actions, className, onClose, sheetScaleStyle, children }: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: ModalAction[];
  className?: string;
  onClose: () => void;
  sheetScaleStyle: object;
  children: React.ReactNode;
}) {
  return (
    <Animated.View
      style={sheetScaleStyle}
      className={cn('w-full max-w-sm rounded-[28px] bg-background p-6', className)}
    >
      <View className="mb-2 items-end">
        <Pressable onPress={onClose} hitSlop={12}>
          <View className="size-8 items-center justify-center rounded-full bg-foreground/10">
            <Icon as={X} className="size-4 text-foreground/60" />
          </View>
        </Pressable>
      </View>

      {icon && (
        <View className="mb-5 items-center">
          {icon}
        </View>
      )}

      {title && (
        <Text variant="h3" className="mb-2 text-center">{title}</Text>
      )}

      {description && (
        <Text variant="body" className="mb-6 text-center leading-5 text-muted-foreground">{description}</Text>
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
