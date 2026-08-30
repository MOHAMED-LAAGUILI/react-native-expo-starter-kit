import type { TextStyle } from 'react-native';
import { NumberFlow } from 'number-flow-react-native';

export type AnimatedNumberProps = {
  value: number;
  format?: Intl.NumberFormatOptions;
  style?: TextStyle;
};

export function AnimatedNumber({
  value,
  format,
  style,
}: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      format={format}
      style={style}
    />
  );
}
