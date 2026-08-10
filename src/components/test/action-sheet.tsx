import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
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
import { Text } from '@/components/ui';
import { useHaptics } from '@/hooks/use-haptics';
import { isIOS } from '@/utils/platform';
import { cn } from '@/utils/utils';

export type ActionSheetOption = {
  title: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  centered?: boolean;
};

export type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelButtonTitle?: string;
  style?: ViewStyle;
  haptic?: boolean;
};

export function ActionSheet(props: ActionSheetProps) {
  if (isIOS) {
    return <IosActionSheet {...props} />;
  }

  return <AndroidActionSheet {...props} />;
}

function IosActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  cancelButtonTitle = 'Cancel',
  haptic = true,
}: ActionSheetProps) {
  const feedback = useHaptics(haptic);

  useEffect(() => {
    if (visible) {
      const optionTitles = options.map(option => option.title);
      const destructiveButtonIndex = options.findIndex(
        option => option.destructive,
      );
      const disabledButtonIndices = options
        .map((option, index) => (option.disabled ? index : -1))
        .filter(index => index !== -1);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          message,
          options: [...optionTitles, cancelButtonTitle],
          cancelButtonIndex: optionTitles.length,
          destructiveButtonIndex:
            destructiveButtonIndex !== -1 ? destructiveButtonIndex : undefined,
          disabledButtonIndices:
            disabledButtonIndices.length > 0 ? disabledButtonIndices : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex < optionTitles.length) {
            feedback(options[buttonIndex].destructive ? 'warning' : 'selection');
            options[buttonIndex].onPress();
          }
          onClose();
        },
      );
    }
  }, [visible, title, message, options, cancelButtonTitle, onClose, feedback]);

  return null;
}

function AndroidActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  cancelButtonTitle = 'Cancel',
  style,
  haptic = true,
}: ActionSheetProps) {
  const [isSheetVisible, setIsSheetVisible] = useState(() => visible);
  const feedback = useHaptics(haptic);
  const progress = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      scheduleOnRN(setIsSheetVisible, true);
    }
    else {
      progress.value = withTiming(
        0,
        { duration: 250, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) {
            scheduleOnRN(setIsSheetVisible, false);
          }
        },
      );
    }
  }, [visible, progress]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [screenHeight, 0]) },
    ],
  }));

  const handleOptionPress = (option: ActionSheetOption) => {
    if (!option.disabled) {
      feedback(option.destructive ? 'warning' : 'selection');
      option.onPress();
      onClose();
    }
  };

  if (!isSheetVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isSheetVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={backdropAnimatedStyle}
        >
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityRole="button"
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              maxHeight: '80%',
              paddingBottom: Math.max(insets.bottom, 16),
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            },
            sheetAnimatedStyle,
            style,
          ]}
          className="rounded-t-2xl bg-card"
        >
          {(title || message) && (
            <ActionSheetHeader title={title} message={message} />
          )}

          <ActionSheetOptions
            options={options}
            onOptionPress={handleOptionPress}
          />

          <ActionSheetCancel title={cancelButtonTitle} onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

function ActionSheetHeader({
  title,
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <View className="items-center px-5 pt-5 pb-4">
      {title && (
        <Text
          variant="bodyLarge"
          className="mb-1 text-center font-semibold"
          numberOfLines={2}
        >
          {title}
        </Text>
      )}
      {message && (
        <Text
          variant="bodySmall"
          className="text-center text-muted-foreground"
          numberOfLines={3}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

function ActionSheetOptions({
  options,
  onOptionPress,
}: {
  options: ActionSheetOption[];
  onOptionPress: (option: ActionSheetOption) => void;
}) {
  return (
    <ScrollView
      style={{ maxHeight: 300 }}
      showsVerticalScrollIndicator={false}
    >
      {options.map(option => (
        <TouchableOpacity
          key={option.title}
          className={cn(
            'items-center border-b border-border px-5 py-4',
            options.indexOf(option) === options.length - 1 && 'border-b-0',
            option.disabled && 'opacity-50',
            option.centered ? 'justify-center' : 'flex-row',
          )}
          onPress={() => onOptionPress(option)}
          disabled={option.disabled}
          activeOpacity={0.6}
          accessibilityRole="menuitem"
          accessibilityState={{ disabled: option.disabled }}
          accessibilityLabel={option.title}
        >
          {option.icon && !option.centered && (
            <View className="mr-3 size-6 items-center justify-center">
              {option.icon}
            </View>
          )}
          <Text
            className={cn(
              'font-medium',
              option.centered ? 'text-center' : 'flex-1',
              option.destructive
                ? 'text-destructive'
                : option.disabled
                  ? 'text-muted-foreground'
                  : 'text-foreground',
            )}
            numberOfLines={1}
          >
            {option.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ActionSheetCancel({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <View className="mt-2 border-t border-border">
      <TouchableOpacity
        className="items-center px-5 py-4"
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Text className="font-semibold">{title}</Text>
      </TouchableOpacity>
    </View>
  );
}
