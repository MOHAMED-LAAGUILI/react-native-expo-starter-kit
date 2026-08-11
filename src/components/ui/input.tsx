import type { TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff, KeyRound, Mail, Phone, Search, User, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { cn } from '@/utils/utils';
import { Icon } from './icon';
import { Text } from './text';

type InputType = 'email' | 'password' | 'phone' | 'search' | 'text' | 'username';

type InputProps = {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  type?: InputType;
} & TextInputProps;

const BUILTIN_LEFT_ICONS: Partial<Record<InputType, React.ReactNode>> = {
  search: <Icon as={Search} className="size-4.5 text-muted-foreground" />,
  phone: <Icon as={Phone} className="size-4.5 text-muted-foreground" />,
  username: <Icon as={User} className="size-4.5 text-muted-foreground" />,
  password: <Icon as={KeyRound} className="size-4.5 text-muted-foreground" />,
  email: <Icon as={Mail} className="size-4.5 text-muted-foreground" />,
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
            <Icon as={EyeOff} className="size-4.5 text-muted-foreground" />
          )
        : (
            <Icon as={Eye} className="size-4.5 text-muted-foreground" />
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
      <Icon as={X} className="size-4.5 text-muted-foreground" />
    </Pressable>
  );
}

function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  className,
  type = 'text',
  value,
  onChangeText,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [secureVisible, setSecureVisible] = React.useState(false);
  const [textValue, setTextValue] = React.useState(value ?? '');

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

  const showLeftIcon = leftIcon ?? BUILTIN_LEFT_ICONS[type];
  const showRightIcon = isSecure
    ? <PasswordToggle visible={secureVisible} onToggle={() => setSecureVisible(v => !v)} />
    : rightIcon;
  const showClearButton = hasText && props.editable !== false;

  return (
    <View className={cn('gap-1', containerStyle)}>
      {label
        ? (
            <Text
              variant="label"
              className="mb-0.5 text-muted-foreground"
            >
              {label}
            </Text>
          )
        : null}
      <View
        className={cn(
          'h-11 flex-row items-center gap-2 rounded-md border px-3',
          'bg-secondary',
          focused ? 'border-ring' : 'border-border',
          error && 'border-destructive',
        )}
        accessibilityElementsHidden={false}
      >
        {showLeftIcon && <View className="items-center justify-center">{showLeftIcon}</View>}
        <TextInput
          className={cn('h-full flex-1 text-base text-foreground outline-0', className)}
          placeholderTextColor="oklch(0.556 0 0)"
          secureTextEntry={resolvedSecureTextEntry}
          value={displayValue}
          onChangeText={handleChangeText}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.accessibilityLabel}-error` : undefined}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {showClearButton && <ClearButton onClear={handleClear} />}
        {showRightIcon && <View className="items-center justify-center">{showRightIcon}</View>}
      </View>
      {error
        ? (
            <Text
              variant="caption"
              className="mt-0.5 text-destructive"
              accessibilityRole="alert"
              nativeID={props.accessibilityLabel ? `${props.accessibilityLabel}-error` : undefined}
            >
              {error}
            </Text>
          )
        : null}
    </View>
  );
}

export type { InputProps, InputType };
export { Input };
