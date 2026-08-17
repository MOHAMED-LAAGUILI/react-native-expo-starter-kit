import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect, useId, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { getPaletteColor } from '@/config/color-palettes';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ChartLoader } from './chart-loader';

// Animated SVG Components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AnimatedRadialBarProps = {
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  strokeWidth: number;
  circumference: number;
  progressRatio: number;
  transform: string;
  animationProgress: SharedValue<number>;
};

// Per-item hook must live in its own mounted subcomponent, not in the
// parent's .map() body — calling useAnimatedProps per loop iteration
// violates Rules of Hooks the moment data.length changes.
function AnimatedRadialBar({
  cx,
  cy,
  r,
  stroke,
  strokeWidth,
  circumference,
  progressRatio,
  transform,
  animationProgress,
}: AnimatedRadialBarProps) {
  const circleAnimatedProps = useAnimatedProps(() => {
    const animatedProgress = animationProgress.value * progressRatio;
    const strokeDashoffset = circumference - animatedProgress * circumference;

    return { strokeDashoffset };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={circumference}
      transform={transform}
      animatedProps={circleAnimatedProps}
    />
  );
}

type ChartConfig = {
  padding?: number;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
};

type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

type RadialBarLayout = {
  size: number;
  center: number;
  maxRadius: number;
  strokeWidth: number;
  maxValue: number;
};

type RadialBarPalette = {
  primary: string;
  muted: string;
  colors: string[];
};

function RadialBarChartSvg({
  data,
  layout,
  palette,
  gradient,
  gradientPrefixId,
  animationProgress,
}: {
  data: ChartDataPoint[];
  layout: RadialBarLayout;
  palette: RadialBarPalette;
  gradient: boolean;
  gradientPrefixId: string;
  animationProgress: SharedValue<number>;
}) {
  const { size, center, maxRadius, strokeWidth, maxValue } = layout;
  const { primary, muted, colors } = palette;

  return (
    <Svg width={size} height={size}>
      <Defs>
        {gradient
          && data.map((item, index) => (
            <LinearGradient
              key={`gradient-${item.label}`}
              id={`radialGradient-${gradientPrefixId}-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop
                offset="0%"
                stopColor={item.color || colors[index % colors.length]}
                stopOpacity="0.3"
              />
              <Stop
                offset="100%"
                stopColor={item.color || colors[index % colors.length]}
                stopOpacity="1"
              />
            </LinearGradient>
          ))}
      </Defs>

      {data.map((item, index) => {
        const radius = maxRadius - index * strokeWidth - strokeWidth / 2;
        const circumference = 2 * Math.PI * radius;
        const progressRatio = item.value / maxValue;

        return (
          <AnimatedRadialBar
            key={`radial-${item.label}`}
            cx={center}
            cy={center}
            r={radius}
            stroke={
              gradient
                ? `url(#radialGradient-${gradientPrefixId}-${index})`
                : item.color || colors[index % colors.length]
            }
            strokeWidth={strokeWidth * 0.8}
            circumference={circumference}
            progressRatio={progressRatio}
            transform={`rotate(-90 ${center} ${center})`}
            animationProgress={animationProgress}
          />
        );
      })}

      {/* Center values */}
      {data.length > 0 && (
        <>
          <SvgText
            x={center}
            y={center - 5}
            textAnchor="middle"
            fontSize={16}
            fill={primary}
            fontWeight="bold"
          >
            {data.reduce((sum, item) => sum + item.value, 0)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize={12}
            fill={muted}
          >
            Total
          </SvgText>
        </>
      )}
    </Svg>
  );
}

function RadialBarChartLegend({
  data,
  colors,
}: {
  data: ChartDataPoint[];
  colors: string[];
}) {
  return (
    <View style={{ marginTop: 15 }}>
      {data.map((item, index) => (
        <View
          key={`legend-${item.label}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: item.color || colors[index % colors.length],
              marginRight: 10,
            }}
          />
          <Text variant="caption">
            {item.label}
            :
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
  loaderDelay?: number;
};

export function RadialBarChart({ data, config = {}, style, loaderDelay = 120 }: Props) {
  const [containerSize, setContainerSize] = useState(200);

  const {
    padding = 20,
    animated = true,
    duration = 1000,
    gradient = false,
  } = config;

  const palette: RadialBarPalette = {
    primary: usePrimaryHex(),
    muted: useThemeColors().muted,
    colors: [
      usePrimaryHex(),
      getPaletteColor('blue'),
      getPaletteColor('green'),
      getPaletteColor('orange'),
      getPaletteColor('purple'),
      getPaletteColor('pink'),
    ],
  };

  const animationProgress = useSharedValue(0);
  // Namespaced so multiple same-config charts on one screen don't collide
  // on shared literal gradient ids.
  const gradientPrefixId = useId();

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height: measuredHeight } = event.nativeEvent.layout;
    const size = Math.min(width, measuredHeight);
    if (size > 0) {
      setContainerSize(size);
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

  const maxValue = Math.max(...data.map(item => item.value));
  if (maxValue === 0)
    return null;

  const size = containerSize || 200;
  const center = size / 2;
  const maxRadius = (size - padding * 2) / 2;
  const strokeWidth = maxRadius / (data.length + 1);

  const layout: RadialBarLayout = {
    size,
    center,
    maxRadius,
    strokeWidth,
    maxValue,
  };

  const chartElement = (
    <View
      style={[{ width: '100%' }, style]}
      accessibilityRole="image"
      accessibilityLabel={`Radial bar chart with ${data.length} bars, maximum value ${Math.round(maxValue)}`}
    >
      <View
        style={{
          width: '100%',
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onLayout={handleLayout}
      >
        <RadialBarChartSvg
          data={data}
          layout={layout}
          palette={palette}
          gradient={gradient}
          gradientPrefixId={gradientPrefixId}
          animationProgress={animationProgress}
        />
      </View>

      {/* Legend */}
      <RadialBarChartLegend data={data} colors={palette.colors} />
    </View>
  );

  return (
    <ChartLoader delay={loaderDelay} minHeight={size}>
      {chartElement}
    </ChartLoader>
  );
}
