import * as RadioGroupPrimitive from "@rn-primitives/radio-group";
import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

function RadioGroup({ value, onValueChange, disabled, className, children }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn("gap-3", className)}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
}

interface RadioGroupItemProps {
  value: string;
  label: string;
  disabled?: boolean;
}

function RadioGroupItem({ value, label, disabled }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className="flex-row items-center gap-3"
    >
      <View className={cn("w-5 h-5 rounded-full border items-center justify-center", "border-border")}>
        <RadioGroupPrimitive.Indicator className="w-3 h-3 rounded-full bg-primary" />
      </View>
      <Text className="text-foreground text-base">{label}</Text>
    </RadioGroupPrimitive.Item>
  );
}

export type { RadioGroupItemProps, RadioGroupProps };
export { RadioGroup, RadioGroupItem };
