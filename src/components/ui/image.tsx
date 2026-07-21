import type { ImageProps as ExpoImageProps } from 'expo-image';
import { Image as ExpoImage } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/utils';

type ImageProps = {
  fallback?: string;
} & ExpoImageProps;

function Image({ className, fallback, style, ...props }: ImageProps) {
  const [errored, setErrored] = React.useState(false);

  let resolvedStyle = style;
  let resolvedTint: string | undefined;

  if (style) {
    const flat = Array.isArray(style) ? style.reduce((acc, s) => ({ ...acc, ...s }), {} as Record<string, unknown>) : { ...style };
    if ('tintColor' in flat) {
      resolvedTint = flat.tintColor as string | undefined;
      const { tintColor: _omit, ...rest } = flat;
      resolvedStyle = rest;
    }
  }

  if (errored && fallback) {
    return (
      <View className={cn('items-center justify-center bg-muted', className)}>
        <View className="size-12 items-center justify-center rounded-full bg-muted-foreground/20">
          <View className="size-5 rounded-full bg-muted-foreground/40" />
        </View>
      </View>
    );
  }

  return (
    <ExpoImage
      className={cn(className)}
      contentFit="cover"
      transition={300}
      onError={() => setErrored(true)}
      {...props}
      style={resolvedStyle}
      tintColor={props.tintColor ?? resolvedTint}
    />
  );
}

export type { ImageProps };
export { Image };
