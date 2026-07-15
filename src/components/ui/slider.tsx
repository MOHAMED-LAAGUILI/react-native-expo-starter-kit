import SliderNative from '@react-native-community/slider';
import { View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';

type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

function Slider({
  value,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
}: SliderProps) {
  const primaryHex = usePrimaryHex();
  const { border } = useThemeColors();

  return (
    <View className={cn('h-10 justify-center', className)}>
      <SliderNative
        style={{ height: 40, width: '100%' }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
        minimumTrackTintColor={primaryHex}
        maximumTrackTintColor={border}
        thumbTintColor={primaryHex}
        tapToSeek
      />
    </View>
  );
}

export type { SliderProps };
export { Slider };
