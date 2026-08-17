import type { LucideIcon } from 'lucide-react-native';
import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { TextInput, View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { Icon } from './icon';
import { Text } from './text';

type GroupedInputItemProps = {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
} & Omit<TextInputProps, 'style'>;

function GroupedInputItem({
  label,
  error,
  icon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...props
}: GroupedInputItemProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const { border, destructive, muted, text } = useThemeColors();
  const primary = usePrimaryHex();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderBottomColor = error ? destructive : isFocused ? primary : border;
  const labelColor = error ? destructive : isFocused ? primary : muted;

  return (
    <View style={containerStyle}>
      <View
        className="flex-row items-center px-3.5"
        style={{
          minHeight: 44,
          borderBottomWidth: 1,
          borderBottomColor,
          gap: 10,
        }}
      >
        {icon && <Icon as={icon} size={18} color={labelColor} />}
        {label && (
          <Text
            variant="label"
            className="shrink-0"
            style={[{ fontSize: 14, fontWeight: '500' }, labelStyle, { color: labelColor }]}
          >
            {label}
          </Text>
        )}
        <TextInput
          {...props}
          placeholderTextColor={muted}
          style={[
            {
              flex: 1,
              paddingVertical: 12,
              fontSize: 16,
              color: text,
              borderWidth: 0,
              backgroundColor: 'transparent',
              outlineWidth: 0,
              boxShadow: 'none',
            },
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="shadow-none outline-none"
        />
      </View>
      {error != null && error.length > 0 && (
        <Text
          variant="caption"
          className="text-destructive mt-1 ml-3.5"
          style={errorStyle}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export type { GroupedInputItemProps };
export { GroupedInputItem };
