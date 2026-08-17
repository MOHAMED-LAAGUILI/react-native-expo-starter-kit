import type { TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { Text } from './text';

type GroupedInputProps = {
  title?: string;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
};

function GroupedInput({
  title,
  children,
  containerStyle,
  titleStyle,
}: GroupedInputProps) {
  const { text } = useThemeColors();

  return (
    <View style={containerStyle}>
      {title && (
        <Text
          variant="label"
          className="mb-2"
          style={[{ color: text, fontSize: 14, fontWeight: '600' }, titleStyle]}
        >
          {title}
        </Text>
      )}
      <View className="overflow-hidden rounded-xl bg-secondary">
        {children}
      </View>
    </View>
  );
}

export type { GroupedInputProps };
export { GroupedInput };
