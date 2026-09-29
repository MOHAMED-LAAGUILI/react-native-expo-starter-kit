import type { TextInputProps } from 'react-native';
import * as React from 'react';
import { TextInput, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { Text } from './text';

type TextAreaProps = {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
} & React.ComponentProps<typeof TextInput>;

function TextArea({ label, error, maxLength, showCount, className, onFocus, onBlur, onChangeText, ...props }: TextAreaProps) {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(props.value ?? props.defaultValue ?? '');
  const { muted } = useThemeColors();

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleChangeText = (t: string) => {
    setText(t);
    onChangeText?.(t);
  };

  return (
    <View className="gap-1">
      {label && <Text variant="label" className="text-muted-foreground">{label}</Text>}
      <View
        className={cn(
          'min-h-[100px] rounded-md border px-3 py-2',
          'bg-secondary',
          focused ? 'border-ring' : 'border-border',
          error && 'border-destructive',
        )}
      >
        <TextInput
          className={cn('text-foreground h-full flex-1 text-base outline-0', className)}
          placeholderTextColor={muted}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
        />
      </View>
      {maxLength && showCount && (
        <Text variant="caption" className="text-muted-foreground text-right">
          {String(text).length}
          /
          {maxLength}
        </Text>
      )}
      {error && <Text variant="caption" className="text-destructive">{error}</Text>}
    </View>
  );
}

export type { TextAreaProps };
export { TextArea };
