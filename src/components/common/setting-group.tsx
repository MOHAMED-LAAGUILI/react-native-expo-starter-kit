import type { ReactNode } from 'react';
import * as React from 'react';
import { View } from 'react-native';
import { Divider } from '@/components/common/divider';

type SettingGroupProps = {
  children: ReactNode[];
  className?: string;
};

function SettingGroup({ children, className }: SettingGroupProps) {
  const [keys] = React.useState(() => children.map(() => Math.random().toString(36).slice(2, 10)));

  return (
    <View className={`border-border bg-card overflow-hidden rounded-xl border ${className ?? ''}`}>
      {children.map((child, i) => (
        <View key={keys[i]}>
          {child}
          {i < children.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  );
}

export { SettingGroup };
