import type { TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff, KeyRound, Mail, Phone, Search, User } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
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

function Input({ label, error, leftIcon, rightIcon, containerStyle, className, type = 'text', ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [secureVisible, setSecureVisible] = React.useState(false);
  const { text, muted } = useThemeColors();
  const iconColor = muted || text;

  const isSecure = type === 'password';
  const resolvedSecureTextEntry = isSecure ? !secureVisible : props.secureTextEntry;

  const builtinLeftIcon = React.useMemo(() => {
    const iconProps = { color: iconColor, size: 18 };
    switch (type) {
      case 'search':
        return <Search {...iconProps} />;
      case 'phone':
        return <Phone {...iconProps} />;
      case 'username':
        return <User {...iconProps} />;
      case 'password':
        return <KeyRound {...iconProps} />;
      case 'email':
        return <Mail {...iconProps} />;
      default:
        return null;
    }
  }, [type, iconColor]);

  const builtinRightIcon = React.useMemo(() => {
    if (!isSecure)
      return null;
    return (
      <Pressable
        onPress={() => setSecureVisible(v => !v)}
        hitSlop={8}
        className="items-center justify-center"
      >
        {secureVisible
          ? (
              <EyeOff
                size={18}
                color={iconColor}
              />
            )
          : (
              <Eye
                size={18}
                color={iconColor}
              />
            )}
      </Pressable>
    );
  }, [isSecure, secureVisible, iconColor]);

  const showLeftIcon = leftIcon ?? builtinLeftIcon;
  const showRightIcon = isSecure ? builtinRightIcon : rightIcon;

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
      >
        {showLeftIcon && <View className="items-center justify-center">{showLeftIcon}</View>}
        <TextInput
          className={cn('h-full flex-1 text-base text-foreground outline-0', className)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={resolvedSecureTextEntry}
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
        {showRightIcon && <View className="items-center justify-center">{showRightIcon}</View>}
      </View>
      {error
        ? (
            <Text
              variant="caption"
              className="mt-0.5 text-destructive"
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
