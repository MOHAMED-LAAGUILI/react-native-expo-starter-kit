import type { ReactNode } from 'react';
import type { BlurEvent, FocusEvent, NativeSyntheticEvent, TextInputKeyPressEventData, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import type { HapticType } from '@/hooks/use-haptics';
import React, {
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { createHapticTrigger } from '@/hooks/use-haptics';
import { cn } from '@/utils/utils';

export type InputOTPProps = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  /** Number of OTP digits */
  length?: number;
  /** Current OTP value */
  value?: string;
  /** Called when OTP value changes */
  onChangeText?: (value: string) => void;
  /** Called when OTP is complete */
  onComplete?: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Individual slot style */
  slotStyle?: ViewStyle;
  /** Error style */
  errorStyle?: TextStyle;
  /** Whether to mask the input (show dots instead of numbers) */
  masked?: boolean;
  /** Separator component between slots */
  separator?: ReactNode;
  /** Whether to show cursor in active slot */
  showCursor?: boolean;
  /** Whether to trigger haptic feedback when the code is complete */
  haptic?: boolean;
};

export type InputOTPRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
};

function useOtpController({
  length,
  value,
  onChangeText,
  onComplete,
  disabled,
  onFocus,
  onBlur,
  feedback,
}: {
  length: number;
  value: string;
  onChangeText?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled: boolean;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: BlurEvent) => void;
  feedback: (type: HapticType) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const normalizedValue = value.slice(0, length);

  const handleChangeText = (text: string) => {
    // Only allow numeric input
    const cleanText = text.replace(/\D/g, '');
    const limitedText = cleanText.slice(0, length);

    onChangeText?.(limitedText);

    // Call onComplete when OTP is fully entered.
    // Deliberately the only haptic here: the system keyboard already emits
    // its own key click, so a per-keystroke buzz would double up on the one
    // interaction the user repeats `length` times.
    if (limitedText.length === length) {
      feedback('success');
      onComplete?.(limitedText);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const { key } = e.nativeEvent;

    if (key === 'Backspace' && normalizedValue.length > 0) {
      onChangeText?.(normalizedValue.slice(0, -1));
    }
  };

  const handleFocus = (e: FocusEvent) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: BlurEvent) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleSlotPress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return {
    isFocused,
    inputRef,
    handleChangeText,
    handleKeyPress,
    handleFocus,
    handleBlur,
    handleSlotPress,
  };
}

function OtpSlot({
  index,
  length,
  state,
  showCursor,
  displayValue,
  error,
  disabled,
  masked,
  onPress,
  separator,
  slotStyle,
}: {
  index: number;
  length: number;
  state: { hasValue: boolean; isActive: boolean; isFocused: boolean };
  showCursor: boolean;
  displayValue: string;
  error: string | undefined;
  disabled: boolean;
  masked: boolean;
  onPress: () => void;
  separator?: ReactNode;
  slotStyle?: ViewStyle;
}) {
  const { hasValue, isActive, isFocused } = state;
  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="keyboardkey"
        accessibilityLabel={
          hasValue
            ? `Digit ${index + 1} of ${length}, ${masked ? 'filled' : displayValue}`
            : `Digit ${index + 1} of ${length}, empty`
        }
        accessibilityState={{ disabled, selected: isActive }}
        style={slotStyle}
        className={cn(
          'aspect-square flex-1 items-center justify-center rounded-xl border',
          error ? 'border-destructive' : isActive ? 'border-ring' : 'border-border',
          disabled ? 'bg-muted opacity-60' : 'bg-card',
        )}
      >
        <Text
          className={cn(
            'text-lg font-semibold',
            error
              ? 'text-destructive'
              : hasValue
                ? 'text-foreground'
                : 'text-muted-foreground',
          )}
        >
          {displayValue}
        </Text>

        {/* Cursor */}
        {showCursor && isActive && !hasValue && (
          <View
            className="bg-primary absolute h-5 w-0.5"
            style={{ opacity: isFocused ? 1 : 0 }}
          />
        )}
      </Pressable>

      {/* Separator */}
      {separator && index < length - 1 && (
        <View className="mx-1">{separator}</View>
      )}
    </>
  );
}

function OtpSlots({
  length,
  normalizedValue,
  isFocused,
  currentActiveIndex,
  showCursor,
  error,
  disabled,
  masked,
  onPress,
  separator,
  slotStyle,
}: {
  length: number;
  normalizedValue: string;
  isFocused: boolean;
  currentActiveIndex: number;
  showCursor: boolean;
  error: string | undefined;
  disabled: boolean;
  masked: boolean;
  onPress: () => void;
  separator?: ReactNode;
  slotStyle?: ViewStyle;
}) {
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ gap: separator ? 0 : 8, width: '100%' }}
    >
      {Array.from({ length }, (_, index) => {
        const hasValue = index < normalizedValue.length;
        const isActive = isFocused && index === currentActiveIndex;
        const displayValue = hasValue
          ? masked
            ? '•'
            : normalizedValue[index]
          : '';

        return (
          <OtpSlot
            key={index}
            index={index}
            length={length}
            state={{ hasValue, isActive, isFocused }}
            showCursor={showCursor}
            displayValue={displayValue}
            error={error}
            disabled={disabled}
            masked={masked}
            onPress={onPress}
            separator={separator}
            slotStyle={slotStyle}
          />
        );
      })}
    </View>
  );
}

export function InputOTP({
  length = 6,
  value = '',
  onChangeText,
  onComplete,
  error,
  disabled = false,
  containerStyle,
  slotStyle,
  errorStyle,
  masked = false,
  separator,
  showCursor = true,
  haptic = true,
  onFocus,
  onBlur,
  ref,
  ...textInputProps
}: InputOTPProps & { ref?: React.Ref<InputOTPRef> }) {
  const feedback = createHapticTrigger(haptic);
  const {
    isFocused,
    inputRef,
    handleChangeText,
    handleKeyPress,
    handleFocus,
    handleBlur,
    handleSlotPress,
  } = useOtpController({
    length,
    value,
    onChangeText,
    onComplete,
    disabled,
    onFocus,
    onBlur,
    feedback,
  });

  // Normalize value to ensure it doesn't exceed length
  const normalizedValue = value.slice(0, length);
  const currentActiveIndex = Math.min(normalizedValue.length, length - 1);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => onChangeText?.(''),
    getValue: () => normalizedValue,
  }));

  return (
    <View style={[{ alignSelf: 'stretch' }, containerStyle]}>
      {/* Hidden TextInput for handling input */}
      <TextInput
        ref={inputRef}
        value={normalizedValue}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="numeric"
        maxLength={length}
        editable={!disabled}
        selectionColor="transparent"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={{
          position: 'absolute',
          left: -9999,
          opacity: 0,
        }}
        {...textInputProps}
      />

      {/* OTP Slots */}
      <OtpSlots
        length={length}
        normalizedValue={normalizedValue}
        isFocused={isFocused}
        currentActiveIndex={currentActiveIndex}
        showCursor={showCursor}
        error={error}
        disabled={disabled}
        masked={masked}
        onPress={handleSlotPress}
        separator={separator}
        slotStyle={slotStyle}
      />

      {/* Error Message */}
      {error && (
        <Text
          className="text-destructive mt-2 text-center text-sm"
          style={errorStyle}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

InputOTP.displayName = 'InputOTP';

// Optional: Export a preset with separator
export function InputOTPWithSeparator({
  ref,
  ...props
}: Omit<InputOTPProps, 'separator'> & { ref?: React.Ref<InputOTPRef> }) {
  return (
    <InputOTP
      ref={ref}
      separator={<Text className="text-muted-foreground text-lg">-</Text>}
      {...props}
    />
  );
}

InputOTPWithSeparator.displayName = 'InputOTPWithSeparator';
