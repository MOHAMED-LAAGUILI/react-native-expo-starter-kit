import * as React from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps extends Omit<ActivityIndicatorProps, "size"> {
  size?: SpinnerSize;
}

const sizeMap: Record<SpinnerSize, "small" | "large"> = {
  lg: "large",
  md: "small",
  sm: "small",
};

const pixelMap: Record<SpinnerSize, number> = {
  lg: 40,
  md: 24,
  sm: 16,
};

function Spinner({ size = "md", ...props }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={sizeMap[size]}
      {...props}
    />
  );
}

export type { SpinnerProps, SpinnerSize };
export { Spinner };
