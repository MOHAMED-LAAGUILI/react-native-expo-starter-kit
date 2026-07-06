import * as ProgressPrimitive from "@rn-primitives/progress";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

function Progress({ value, className }: ProgressProps) {
  return (
    <ProgressPrimitive.Root className={cn("h-2 rounded-full bg-border overflow-hidden", className)}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export type { ProgressProps };
export { Progress };
