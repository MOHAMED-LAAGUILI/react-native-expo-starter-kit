import * as SwitchPrimitives from '@rn-primitives/switch';
import { View } from 'react-native';
import { cn } from '@/utils/utils';

type SwitchVariant = 'default' | 'liquid-glass' | 'square';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: SwitchVariant;
  className?: string;
};

function Switch({
  checked,
  onCheckedChange,
  disabled,
  variant = 'default',
  className,
}: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'h-6 w-11 flex-row items-center',
        variant === 'square' ? 'rounded-none border-2 px-0' : 'rounded-full px-0.5',
        variant === 'default' && (checked ? 'bg-primary' : 'bg-muted-foreground/30'),
        variant === 'liquid-glass' && [
          checked
            ? 'bg-primary/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.18),0_3px_10px_rgba(0,0,0,0.08)]'
            : 'bg-muted-foreground/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.14)]',
        ],
        variant === 'square' && [
          checked ? 'border-primary bg-primary' : 'border-primary/40 bg-primary/10 dark:border-primary/60 dark:bg-primary/20',
        ],
        disabled && 'opacity-50',
        className,
      )}
    >
      {variant === 'liquid-glass' && (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-white/15"
        />
      )}
      <SwitchPrimitives.Thumb
        className={cn(
          'size-5 bg-background shadow-sm',
          'transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
          variant === 'default' && 'rounded-full',
          variant === 'liquid-glass' && [
            'rounded-full bg-white/90',
            'shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.25)]',
          ],
          variant === 'square' && 'rounded-none',
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export type { SwitchProps, SwitchVariant };
export { Switch };
