import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';

/**
 * Progress indicators drawn with react-native-svg + Reanimated — no extra
 * dependency, identical on iOS, Android and web. Spinners rotate a wrapping
 * view (a UI-thread transform), never re-render per frame.
 *
 *   <Progress.Bar progress={0.3} width={200} color={primary} unfilledColor={muted} />
 *   <Progress.Pie progress={0.4} size={50} color={primary} />
 *   <Progress.Circle progress={0.7} size={40} color={primary} />   // determinate ring
 *   <Progress.Circle indeterminate size={30} color={primary} />    // spinner
 *   <Progress.CircleSnail color={[a, b, c]} size={30} />            // multi-colour spinner
 */

const clamp = (value: number) => Math.min(1, Math.max(0, value));

type BarProps = {
  progress: number;
  width?: number;
  height?: number;
  color: string;
  unfilledColor?: string;
  borderRadius?: number;
};

function Bar({ progress, width = 150, height = 6, color, unfilledColor = 'transparent', borderRadius = 4 }: BarProps) {
  const fill = useSharedValue(clamp(progress));

  useEffect(() => {
    fill.set(withTiming(clamp(progress), { duration: 250, easing: Easing.out(Easing.quad) }));
  }, [fill, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: fill.value * width }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(progress) * 100) }}
      style={{ width, height, borderRadius, backgroundColor: unfilledColor, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius, backgroundColor: color }, fillStyle]} />
    </View>
  );
}

/** SVG path of a pie slice starting at 12 o'clock, clockwise. */
function slicePath(fraction: number, radius: number) {
  const angle = fraction * 2 * Math.PI;
  const x = radius + radius * Math.sin(angle);
  const y = radius - radius * Math.cos(angle);
  const largeArc = fraction > 0.5 ? 1 : 0;
  return `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`;
}

type PieProps = { progress: number; size?: number; color: string; unfilledColor?: string };

function Pie({ progress, size = 40, color, unfilledColor }: PieProps) {
  const value = clamp(progress);
  const r = size / 2;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Svg width={size} height={size}>
        <SvgCircle cx={r} cy={r} r={r - 1} fill={unfilledColor ?? 'none'} stroke={color} strokeWidth={1} />
        {value >= 1
          ? <SvgCircle cx={r} cy={r} r={r} fill={color} />
          : value > 0 && <Path d={slicePath(value, r)} fill={color} />}
      </Svg>
    </View>
  );
}

/** Continuous 0→360° rotation, paused when the OS asks for reduced motion. */
function useSpin(duration: number) {
  const rotation = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion)
      return;
    rotation.set(withRepeat(withTiming(360, { duration, easing: Easing.linear }), -1));
    return () => cancelAnimation(rotation);
  }, [duration, reduceMotion, rotation]);

  return useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
}

type RingProps = { size: number; thickness: number; color: string; fraction: number; trackColor?: string };

function Ring({ size, thickness, color, fraction, trackColor }: RingProps) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      {trackColor && <SvgCircle cx={c} cy={c} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />}
      <SvgCircle
        cx={c}
        cy={c}
        r={r}
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference * fraction} ${circumference}`}
        transform={`rotate(-90 ${c} ${c})`}
      />
    </Svg>
  );
}

type CircleProps = {
  size?: number;
  thickness?: number;
  color: string;
  unfilledColor?: string;
  progress?: number;
  indeterminate?: boolean;
};

function Circle({ size = 40, thickness = 3, color, unfilledColor, progress = 0, indeterminate = false }: CircleProps) {
  const spin = useSpin(1000);
  if (indeterminate) {
    return (
      <Animated.View accessibilityRole="progressbar" style={[{ width: size, height: size }, spin]}>
        <Ring size={size} thickness={thickness} color={color} fraction={0.75} trackColor={unfilledColor} />
      </Animated.View>
    );
  }
  const value = clamp(progress);
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Ring size={size} thickness={thickness} color={color} fraction={value} trackColor={unfilledColor} />
    </View>
  );
}

type CircleSnailProps = { size?: number; thickness?: number; color: string | string[] };

/** Spinner whose arc steps through `color` once per revolution. */
function CircleSnail({ size = 40, thickness = 3, color }: CircleSnailProps) {
  const colors = Array.isArray(color) ? color : [color];
  const [index, setIndex] = useState(0);
  const spin = useSpin(900);

  useEffect(() => {
    if (colors.length < 2)
      return;
    const timer = setInterval(() => setIndex(i => (i + 1) % colors.length), 900);
    return () => clearInterval(timer);
  }, [colors.length]);

  return (
    <Animated.View accessibilityRole="progressbar" style={[{ width: size, height: size }, spin]}>
      <Ring size={size} thickness={thickness} color={colors[index % colors.length]} fraction={0.3} />
    </Animated.View>
  );
}

const Progress = { Bar, Pie, Circle, CircleSnail };

export type { BarProps, CircleProps, CircleSnailProps, PieProps };
export { Progress };
