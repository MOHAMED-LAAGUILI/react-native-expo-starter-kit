import type { ViewStyle } from 'react-native';
import { LineChart } from './line-chart';

type ChartConfig = {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  interactive?: boolean;
  showYLabels?: boolean;
  yLabelCount?: number;
  yAxisWidth?: number;
};

type ChartDataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};
export function AreaChart({ data, config = {}, style }: Props) {
  return (
    <LineChart
      data={data}
      config={{ ...config, gradient: true }}
      style={style}
    />
  );
}
