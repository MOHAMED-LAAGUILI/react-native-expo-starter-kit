import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { cn } from '@/utils/utils';
import { Icon } from './icon';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

function Checkbox({ checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'size-5 items-center justify-center rounded-sm border',
        checked ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
        disabled && 'opacity-50',
        className,
      )}
    >
      {checked && (
        <Icon as={Check} className="text-primary-foreground size-3.5" />
      )}
    </Pressable>
  );
}

export type { CheckboxProps };
export { Checkbox };
