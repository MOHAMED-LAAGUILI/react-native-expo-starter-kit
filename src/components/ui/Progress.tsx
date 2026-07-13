import * as ProgressPrimitive from '@rn-primitives/progress';
import { cn } from '@/utils/utils';

type ProgressProps = {
  value: number;
  className?: string;
};

function Progress({ value, className }: ProgressProps) {
  return (
    <ProgressPrimitive.Root className={cn('h-2 overflow-hidden rounded-full bg-border', className)}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export type { ProgressProps };
export { Progress };
