import * as SwitchPrimitives from "@rn-primitives/switch";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "w-11 h-6 rounded-full flex-row items-center px-0.5",
        checked ? "bg-primary" : "bg-border",
        disabled && "opacity-50",
        className
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "w-5 h-5 rounded-full bg-background shadow-sm",
          "transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export type { SwitchProps };
export { Switch };
