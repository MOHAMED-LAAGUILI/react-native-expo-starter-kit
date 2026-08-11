import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

// Animated SVG Components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AnimatedVertexProps = {
  cx: number;
  cy: number;
  fill: string;
  index: number;
  animationProgress: SharedValue<number>;
};

// Per-item hook must live in its own mounted subcomponent, not in the
// parent's .map() body — calling useAnimatedProps per loop iteration
// violates Rules of Hooks the moment data.length changes.
function AnimatedVertex({ cx, cy, fill, index, animationProgress }: AnimatedVertexProps) {
  const pointAnimatedProps = useAnimatedProps(() => ({
    opacity: animationProgress.value,
    r: withDelay(index * 100, withSpring(animationProgress.value * 4)),
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={fill}
      animatedProps={pointAnimatedProps}
    />
  );
}

type ChartConfig = {
  width?: number;
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  maxValue?: number;
};

type RadarChartDataPoint = {
  label: string;
  value: number;
};

type RadarPoint = {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  label: string;
};

type RadarLayout = {
  chartWidth: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
  angleStep: number;
  maxVal: number;
};

type RadarPalette = {
  primary: string;
  muted: string;
};

function RadarChartSvg({
  points,
  layout,
  palette,
  showLabels,
  animationProgress,
}: {
  points: RadarPoint[];
  layout: RadarLayout;
  palette: RadarPalette;
  showLabels: boolean;
  animationProgress: SharedValue<number>;
}) {
  const { chartWidth, height, centerX, centerY, radius, angleStep } = layout;

  const radarAnimatedProps = useAnimatedProps(() => ({
    opacity: animationProgress.value * 0.3,
  }));

  // Create path for the radar area
  const radarPath
    = points.length > 0
      ? `M${points[0].x},${points[0].y} ${
        points
          .slice(1)
          .map(point => `L${point.x},${point.y}`)
          .join(' ')
      } Z`
      : '';

  return (
    <Svg width={chartWidth} height={height}>
      {/* Grid circles */}
      {[0.2, 0.4, 0.6, 0.8, 1].map(ratio => (
        <Circle
          key={`grid-circle-${ratio}`}
          cx={centerX}
          cy={centerY}
          r={radius * ratio}
          stroke={palette.muted}
          strokeWidth={0.5}
          fill="none"
          opacity={0.3}
        />
      ))}

      {/* Grid lines */}
      {points.map((point, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);

        return (
          <Line
            key={`grid-line-${point.label}`}
            x1={centerX}
            y1={centerY}
            x2={endX}
            y2={endY}
            stroke={palette.muted}
            strokeWidth={0.5}
            opacity={0.3}
          />
        );
      })}

      {/* Radar area */}
      <AnimatedPath
        d={radarPath}
        fill={palette.primary}
        stroke={palette.primary}
        strokeWidth={2}
        animatedProps={radarAnimatedProps}
      />

      {/* Data points */}
      {points.map((point, index) => (
        <AnimatedVertex
          key={`radar-point-${point.label}`}
          cx={point.x}
          cy={point.y}
          fill={palette.primary}
          index={index}
          animationProgress={animationProgress}
        />
      ))}

      {/* Labels */}
      {showLabels
        && points.map(point => (
          <SvgText
            key={`label-${point.label}`}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            fontSize={12}
            fill={palette.muted}
            alignmentBaseline="middle"
          >
            {point.label}
          </SvgText>
        ))}
    </Svg>
  );
}

type Props = {
  data: RadarChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

export function RadarChart({ data, config = {}, style }: Props) {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    showLabels = true,
    animated = true,
    duration = 1000,
    maxValue,
  } = config;

  const chartWidth = containerWidth || config.width || 300;

  const palette: RadarPalette = {
    primary: usePrimaryHex(),
    muted: useThemeColors().muted,
  };

  const animationProgress = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  useEffect(() => {
    if (animated) {
      animationProgress.set(withTiming(1, { duration }));
    }
    else {
      animationProgress.set(1);
    }
  }, [data, animated, duration, animationProgress]);

  if (!data.length)
    return null;

  const centerX = chartWidth / 2;
  const centerY = height / 2;
  const radius = Math.min(chartWidth, height) / 2 - 40;
  // `??` (not `||`) so an explicit maxValue={0} isn't silently discarded.
  const maxVal = maxValue ?? Math.max(...data.map(item => item.value));
  if (maxVal === 0)
    return null;

  // Calculate points for each data point
  const angleStep = (2 * Math.PI) / data.length;
  const points: RadarPoint[] = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const distance = (item.value / maxVal) * radius;
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
      labelX: centerX + (radius + 20) * Math.cos(angle),
      labelY: centerY + (radius + 20) * Math.sin(angle),
      label: item.label,
    };
  });

  const layout: RadarLayout = {
    chartWidth,
    height,
    centerX,
    centerY,
    radius,
    angleStep,
    maxVal,
  };

  return (
    <View
      style={[{ width: '100%', height }, style]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Radar chart with ${data.length} axes, maximum value ${Math.round(maxVal)}`}
    >
      <RadarChartSvg
        points={points}
        layout={layout}
        palette={palette}
        showLabels={showLabels}
        animationProgress={animationProgress}
      />
    </View>
  );
}
