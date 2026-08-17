import type { TextProps as RNTextProps } from 'react-native';
import * as React from 'react';
import { Platform, Text as RNText } from 'react-native';
import { cn } from '@/utils/utils';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label' | 'blockquote';

type TextProps = {
  variant?: TextVariant | undefined | string;
} & RNTextProps;

function Text({ variant = 'body', className, ...props }: TextProps) {
  const textClass = React.use(TextClassContext);
  return (
    <RNText
      className={cn(
        'text-base/normal text-foreground',
        textClass,
        variant === 'h1' && 'text-4xl font-extrabold tracking-tight',
        variant === 'h2' && 'text-3xl font-semibold tracking-tight',
        variant === 'h3' && 'text-2xl font-semibold tracking-tight',
        variant === 'h4' && 'text-xl font-semibold tracking-tight',
        variant === 'bodyLarge' && 'text-lg',
        variant === 'bodySmall' && 'text-sm',
        variant === 'caption' && 'text-xs',
        variant === 'label' && 'text-sm font-medium',
        variant === 'blockquote' && 'border-l-2 border-border pl-3 text-muted-foreground italic',
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
