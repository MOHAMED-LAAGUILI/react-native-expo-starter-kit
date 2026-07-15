import type { ActivityIndicatorProps } from 'react-native';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';

type SpinnerSize = 'sm' | 'md' | 'lg';

type SpinnerProps = {
  size?: SpinnerSize;
} & Omit<ActivityIndicatorProps, 'size'>;

const sizeMap: Record<SpinnerSize, 'small' | 'large'> = {
  lg: 'large',
  md: 'small',
  sm: 'small',
};

function Spinner({ size = 'md', ...props }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={sizeMap[size]}
      {...props}
    />
  );
}

export type { SpinnerProps, SpinnerSize };
export { Spinner };
