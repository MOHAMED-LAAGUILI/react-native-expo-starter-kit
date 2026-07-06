import { Image as ExpoImage, type ImageProps as ExpoImageProps } from "expo-image";
import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface ImageProps extends ExpoImageProps {
  fallback?: string;
}

function Image({ className, fallback, ...props }: ImageProps) {
  const [errored, setErrored] = React.useState(false);

  if (errored && fallback) {
    return (
      <View className={cn("items-center justify-center bg-muted", className)}>
        <View className="w-12 h-12 rounded-full bg-muted-foreground/20 items-center justify-center">
          <View className="w-5 h-5 rounded-full bg-muted-foreground/40" />
        </View>
      </View>
    );
  }

  return (
    <ExpoImage
      className={cn(className)}
      contentFit="cover"
      onError={() => setErrored(true)}
      {...props}
    />
  );
}

export type { ImageProps };
export { Image };
