import type { LucideIcon } from 'lucide-react-native';
import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { Eye, EyeOff, KeyRound, Mail, Phone, Search, User, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Icon } from './icon';
import { Text } from './text';

type InputType = 'email' | 'password' | 'phone' | 'search' | 'text' | 'username';

type InputProps = {
  ref?: React.Ref<TextInput>;
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  icon?: LucideIcon;
  variant?: 'filled' | 'outline';
  type?: InputType;
  disabled?: boolean;
} & Omit<TextInputProps, 'style'>;

const BUILTIN_LEFT_ICONS: Partial<Record<InputType, React.ReactNode>> = {
  search: <Icon as={Search} className="text-muted-foreground size-4.5" />,
  phone: <Icon as={Phone} className="text-muted-foreground size-4.5" />,
  username: <Icon as={User} className="text-muted-foreground size-4.5" />,
  password: <Icon as={KeyRound} className="text-muted-foreground size-4.5" />,
  email: <Icon as={Mail} className="text-muted-foreground size-4.5" />,
};

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? t('common.hidePassword') : t('common.showPassword')}
      accessibilityState={{ selected: visible }}
      className="items-center justify-center"
    >
      {visible
        ? (
            <Icon as={EyeOff} className="text-muted-foreground size-4.5" />
          )
        : (
            <Icon as={Eye} className="text-muted-foreground size-4.5" />
          )}
    </Pressable>
  );
}

function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onClear}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('common.clear')}
      className="items-center justify-center"
    >
      <Icon as={X} className="text-muted-foreground size-4.5" />
    </Pressable>
  );
}

type InputFieldProps = {
  ref?: React.Ref<TextInput>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  icon?: LucideIcon;
  variant?: 'filled' | 'outline';
  type?: InputType;
  disabled?: boolean;
  error?: string;
  inputStyle?: TextStyle;
} & Omit<TextInputProps, 'style'>;

function InputField({
  ref,
  leftIcon,
  rightIcon,
  rightComponent,
  icon,
  variant = 'filled',
  disabled = false,
  type = 'text',
  error,
  className,
  value,
  onChangeText,
  onFocus,
  onBlur,
  inputStyle,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [secureVisible, setSecureVisible] = React.useState(false);
  const [textValue, setTextValue] = React.useState(value ?? '');
  const { border, destructive, muted } = useThemeColors();
  const primary = usePrimaryHex();
  const inputRef = React.useRef<TextInput>(null);
  const setRef = (node: TextInput | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    }
    else if (ref) {
      ref.current = node;
    }
  };

  const isSecure = type === 'password';
  const resolvedSecureTextEntry = isSecure ? !secureVisible : props.secureTextEntry;
  const displayValue = value ?? textValue;
  const hasText = displayValue.length > 0;

  const handleChangeText = (text: string) => {
    setTextValue(text);
    onChangeText?.(text);
  };

  const handleClear = () => {
    setTextValue('');
    onChangeText?.('');
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const isOutline = variant === 'outline';
  const iconColor = error ? destructive : isFocused ? primary : muted;
  const resolvedBorderColor = error ? destructive : isFocused ? primary : isOutline ? border : undefined;
  const resolvedBg = isOutline ? 'bg-transparent' : 'bg-secondary';
  const showLeftIcon = leftIcon ?? (icon ? undefined : BUILTIN_LEFT_ICONS[type]);
  const resolvedRightIcon = isSecure
    ? <PasswordToggle visible={secureVisible} onToggle={() => setSecureVisible(v => !v)} />
    : rightComponent
      ? typeof rightComponent === 'function' ? rightComponent() : rightComponent
      : rightIcon;
  const showClearButton = hasText && props.editable !== false;

  return (
    <View
      className={cn(
        'h-11 flex-row items-center gap-2 rounded-md border px-3',
        resolvedBg,
        resolvedBorderColor ? '' : isFocused ? 'border-ring' : 'border-border',
        error && 'border-destructive',
      )}
      style={resolvedBorderColor ? { borderColor: resolvedBorderColor } : undefined}
      accessibilityElementsHidden={false}
    >
      {icon
        ? (
            <View className="items-center justify-center">
              <Icon as={icon} size={18} color={iconColor} />
            </View>
          )
        : showLeftIcon
          ? <View className="items-center justify-center">{showLeftIcon}</View>
          : null}
      <TextInput
        ref={setRef}
        className={cn('text-foreground h-full flex-1 text-base outline-0', className)}
        style={inputStyle}
        placeholderTextColor={props.placeholderTextColor ?? muted}
        secureTextEntry={resolvedSecureTextEntry}
        value={displayValue}
        onChangeText={handleChangeText}
        editable={!disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.accessibilityLabel}-error` : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {showClearButton && <ClearButton onClear={handleClear} />}
      {resolvedRightIcon && <View className="items-center justify-center">{resolvedRightIcon}</View>}
    </View>
  );
}

function Input({
  ref,
  label,
  error,
  leftIcon,
  rightIcon,
  rightComponent,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  icon,
  variant = 'filled',
  disabled = false,
  type = 'text',
  className,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={containerStyle} className="gap-1">
      {label && (
        <Text
          variant="label"
          className={cn('mb-0.5', error ? 'text-destructive' : isFocused ? 'text-primary' : 'text-muted-foreground')}
          style={labelStyle}
          onPress={() => inputRef.current?.focus()}
        >
          {label}
        </Text>
      )}

      <InputField
        ref={inputRef}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        rightComponent={rightComponent}
        icon={icon}
        variant={variant}
        disabled={disabled}
        type={type}
        error={error}
        className={className}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputStyle={inputStyle}
        {...props}
      />

      {error != null && error.length > 0 && (
        <Text
          variant="caption"
          className="text-destructive mt-0.5"
          style={errorStyle}
          accessibilityRole="alert"
          nativeID={props.accessibilityLabel ? `${props.accessibilityLabel}-error` : undefined}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export type { GroupedInputProps } from './grouped-input';
export { GroupedInput } from './grouped-input';
export type { GroupedInputItemProps } from './grouped-input-item';
export { GroupedInputItem } from './grouped-input-item';
export type { InputProps, InputType };
export { Input };
