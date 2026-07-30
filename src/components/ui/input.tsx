import type { TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff, KeyRound, Mail, Phone, Search, User } from 'lucide-react-native';
import * as React from 'react';
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

function Input({ label, error, leftIcon, rightIcon, containerStyle, className, type = 'text', ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [secureVisible, setSecureVisible] = React.useState(false);

  const isSecure = type === 'password';
  const resolvedSecureTextEntry = isSecure ? !secureVisible : props.secureTextEntry;

  const builtinLeftIcon = (() => {
    switch (type) {
      case 'search':
        return <Icon as={Search} className="text-muted-foreground size-[18px]" />;
      case 'phone':
        return <Icon as={Phone} className="text-muted-foreground size-[18px]" />;
      case 'username':
        return <Icon as={User} className="text-muted-foreground size-[18px]" />;
      case 'password':
        return <Icon as={KeyRound} className="text-muted-foreground size-[18px]" />;
      case 'email':
        return <Icon as={Mail} className="text-muted-foreground size-[18px]" />;
      default:
        return null;
    }
  })();

  const builtinRightIcon = !isSecure
    ? null
    : (
        <Pressable
          onPress={() => setSecureVisible(v => !v)}
          hitSlop={8}
          className="items-center justify-center"
        >
          {secureVisible
            ? (
                <Icon as={EyeOff} className="text-muted-foreground size-[18px]" />
              )
            : (
                <Icon as={Eye} className="text-muted-foreground size-[18px]" />
              )}
        </Pressable>
      );

  const showLeftIcon = leftIcon ?? builtinLeftIcon;
  const showRightIcon = isSecure ? builtinRightIcon : rightIcon;

  return (
    <View className={cn('gap-1', containerStyle)}>
      {label
        ? (
            <Text
              variant="label"
              className="text-muted-foreground mb-0.5"
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
          className={cn('text-foreground h-full flex-1 text-base outline-0', className)}
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
              className="text-destructive mt-0.5"
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
