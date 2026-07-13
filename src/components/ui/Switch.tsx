import * as SwitchPrimitives from '@rn-primitives/switch';
import { cn } from '@/utils/utils';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'h-6 w-11 flex-row items-center rounded-full px-0.5',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
        disabled && 'opacity-50',
        className,
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'size-5 rounded-full bg-background shadow-sm',
          'transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export type { SwitchProps };
export { Switch };
