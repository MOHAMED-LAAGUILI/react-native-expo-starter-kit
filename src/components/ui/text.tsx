import type { TextProps as RNTextProps } from 'react-native';
import * as React from 'react';
import { Platform, Text as RNText } from 'react-native';
import { cn } from '@/utils/utils';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';

type TextProps = {
  variant?: TextVariant;
} & RNTextProps;

function Text({ variant = 'body', className, ...props }: TextProps) {
  return (
    <RNText
      className={cn(
        'text-base text-foreground',
        variant === 'h1' && 'text-4xl font-extrabold tracking-tight',
        variant === 'h2' && 'text-3xl font-semibold tracking-tight',
        variant === 'h3' && 'text-2xl font-semibold tracking-tight',
        variant === 'h4' && 'text-xl font-semibold tracking-tight',
        variant === 'bodyLarge' && 'text-lg',
        variant === 'bodySmall' && 'text-sm',
        variant === 'caption' && 'text-xs',
        variant === 'label' && 'text-sm font-medium',
        Platform.select({ web: 'select-text' }),
        className,
      )}
      {...props}
    />
  );
}
const TextClassContext = React.createContext<string | undefined>(undefined);

export type { TextProps, TextVariant };
export { Text, TextClassContext };
