import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { Check } from "lucide-react-native";
import * as React from "react";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function Checkbox({ checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "w-5 h-5 rounded border items-center justify-center",
        checked ? "bg-primary border-primary" : "bg-background border-border",
        disabled && "opacity-50",
        className
      )}
    >
      {checked && (
        <Check
          size={14}
          className="text-primary-foreground"
        />
      )}
    </Pressable>
  );
}

export type { CheckboxProps };
export { Checkbox };
