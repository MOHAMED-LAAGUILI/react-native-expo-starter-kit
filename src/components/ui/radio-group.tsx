import type * as React from 'react';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import { View } from 'react-native';
import { cn } from '@/utils/utils';
import { Text } from './text';

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

function RadioGroup({ value, onValueChange, disabled, className, children }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn('gap-3', className)}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
}

type RadioGroupItemProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

function RadioGroupItem({ value, label, disabled }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className="flex-row items-center gap-3"
    >
      <View className={cn('size-5 items-center justify-center rounded-full border', 'border-muted-foreground/30')}>
        <RadioGroupPrimitive.Indicator className="bg-primary size-3 rounded-full" />
      </View>
      <Text className="text-foreground text-base">{label}</Text>
    </RadioGroupPrimitive.Item>
  );
}

export type { RadioGroupItemProps, RadioGroupProps };
export { RadioGroup, RadioGroupItem };
