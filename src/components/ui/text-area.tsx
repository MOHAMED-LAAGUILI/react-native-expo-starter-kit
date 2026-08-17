import * as React from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '@/utils/utils';
import { Text } from './text';

type TextAreaProps = {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
} & React.ComponentProps<typeof TextInput>;

function TextArea({ label, error, maxLength, showCount, className, ...props }: TextAreaProps) {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(props.value ?? props.defaultValue ?? '');

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
          className="h-full flex-1 text-base text-foreground outline-0"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          onChangeText={(t) => {
            setText(t);
            props.onChangeText?.(t);
          }}
          {...props}
        />
      </View>
      {maxLength && showCount && (
        <Text variant="caption" className="text-right text-muted-foreground">
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
