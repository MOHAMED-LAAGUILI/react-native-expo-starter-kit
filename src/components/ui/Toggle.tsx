import type * as React from 'react';
import * as TogglePrimitive from '@rn-primitives/toggle';
import { cn } from '@/utils/utils';
import { Text } from './text';

type ToggleProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Toggle({ pressed, onPressedChange, disabled, className, children }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cn(
        'flex-row items-center gap-2 rounded-md px-3 py-2',
        pressed ? 'bg-primary' : 'bg-secondary',
        disabled && 'opacity-50',
        className,
      )}
    >
      <Text className={cn('text-base font-medium', pressed ? 'text-primary-foreground' : 'text-foreground')}>
        {children}
      </Text>
    </TogglePrimitive.Root>
  );
}

export type { ToggleProps };
export { Toggle };
