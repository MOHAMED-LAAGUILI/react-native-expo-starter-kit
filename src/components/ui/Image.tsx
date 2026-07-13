import type { ImageProps as ExpoImageProps } from 'expo-image';
import { Image as ExpoImage } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { cn } from '@/utils/utils';

type ImageProps = {
  fallback?: string;
} & ExpoImageProps;

function Image({ className, fallback, style, ...props }: ImageProps) {
  const [errored, setErrored] = React.useState(false);

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
      style={StyleSheet.flatten(style)}
      {...props}
    />
  );
}

export type { ImageProps };
export { Image };
