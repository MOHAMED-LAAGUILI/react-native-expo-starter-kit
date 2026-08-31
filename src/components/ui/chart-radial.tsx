import type { LayoutChangeEvent } from 'react-native';
import type { ChartDataItem } from './chart';
import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { useThemeColors } from '@/hooks/use-theme-color';
import { chartItemKey, getAxisColor, getTrackColor } from '@/utils/chart';
import { cn } from '@/utils/cn';
import { Text } from './text';

type ArcInput = {
  center: number;
  radius: number;
  start: number;
  end: number;
};

type ChartPolarAreaProps = {
  data: ChartDataItem[];
  size?: number;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

type ChartRadialBarProps = {
  data: ChartDataItem[];
  /** Value that fills a track completely. Defaults to the largest value in `data`. */
  maxValue?: number;
  size?: number;
  thickness?: number;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

type RadialTrack = {
  color: string;
  key: string;
  radius: number;
  ratio: number;
};

type ChartRadarProps = {
  data: ChartDataItem[];
  chartSize?: number;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

type ChartProgressRingProps = {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color: string;
  label?: string;
  sublabel?: string;
  className?: string;
};

const FULL_TURN = 360;
/** SVG angles start at the 3 o clock position; charts read better starting at the top. */
const START_ANGLE = -90;
/** Radial bars stop short of a full turn so the start and end of a track stay distinguishable. */
const RADIAL_SWEEP = 270;
/** A single arc command cannot close a full turn, so a completed ring stops a hair short. */
const MAX_RING_SWEEP = 359.9;
const RING_RATIOS = [0.25, 0.5, 0.75, 1];
const GRID_DASH = '4 4';
const TRACK_GAP = 6;
const FALLBACK_SERIES_COLOR = '#8b5cf6';
/** Room reserved around the radar web for its axis labels. */
const RADAR_LABEL_PADDING = 30;
const RADAR_LABEL_FONT_SIZE = 10;
const RADAR_LABEL_MAX_LENGTH = 12;

function polarPoint({ center, radius, angle }: { center: number; radius: number; angle: number }) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

/** Filled pie-style wedge, used by the polar area chart. */
function wedgePath({ center, radius, start, end }: ArcInput) {
  const from = polarPoint({ center, radius, angle: start });
  const to = polarPoint({ center, radius, angle: end });
  const largeArc = end - start > 180 ? 1 : 0;

  return `M ${center} ${center} L ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y} Z`;
}

/** Open arc stroked as a ring segment, used by radial bars and the progress ring. */
function arcPath({ center, radius, start, end }: ArcInput) {
  const from = polarPoint({ center, radius, angle: start });
  const to = polarPoint({ center, radius, angle: end });
  const largeArc = end - start > 180 ? 1 : 0;

  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
}

function clampRatio(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return Math.min(Math.max(value / max, 0), 1);
}

function trackRadius({ center, thickness, index }: { center: number; thickness: number; index: number }) {
  return center - thickness / 2 - index * (thickness + TRACK_GAP);
}

/**
 * Equal-angle slices whose radius encodes the value. Radius scales with the
 * square root so the *area* of a slice stays proportional to what it represents.
 */
function ChartPolarArea({ data, size = 220, className, onLayout }: ChartPolarAreaProps) {
  const { isDark } = useThemeColors();
  const gridColor = getAxisColor(isDark);
  const center = size / 2;
  const maxRadius = center - 6;
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const step = FULL_TURN / Math.max(data.length, 1);

  return (
    <View className={cn('w-full items-center', className)} onLayout={onLayout}>
      <Svg width={size} height={size}>
        {RING_RATIOS.map(ratio => (
          <Circle
            key={`ring-${ratio}`}
            cx={center}
            cy={center}
            r={maxRadius * ratio}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
            strokeDasharray={GRID_DASH}
          />
        ))}
        {data.map((item, index) => {
          const start = START_ANGLE + index * step;

          return (
            <Path
              key={`slice-${chartItemKey(item)}`}
              d={wedgePath({
                center,
                radius: maxRadius * Math.sqrt(clampRatio(item.value, maxValue)),
                start,
                end: start + step - 1.5,
              })}
              fill={item.color}
              fillOpacity={0.8}
              stroke={item.color}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

/** Concentric tracks, one per series, each filled to its share of `maxValue`. */
function ChartRadialBar({
  data,
  maxValue,
  size = 220,
  thickness = 14,
  className,
  onLayout,
}: ChartRadialBarProps) {
  const { isDark } = useThemeColors();
  const trackColor = getTrackColor(isDark);
  const center = size / 2;
  const scaleMax = maxValue ?? Math.max(...data.map(item => item.value), 1);

  // Built in a single pass: past a certain series count the inner tracks would
  // collapse through the centre, so those are dropped as they are computed.
  const tracks = data.reduce<RadialTrack[]>((acc, item, index) => {
    const radius = trackRadius({ center, thickness, index });

    if (radius > thickness / 2) {
      acc.push({
        color: item.color,
        key: chartItemKey(item),
        radius,
        ratio: clampRatio(item.value, scaleMax),
      });
    }

    return acc;
  }, []);

  return (
    <View className={cn('w-full items-center', className)} onLayout={onLayout}>
      <Svg width={size} height={size}>
        {tracks.map(track => (
          <Fragment key={track.key}>
            <Path
              d={arcPath({
                center,
                radius: track.radius,
                start: START_ANGLE,
                end: START_ANGLE + RADIAL_SWEEP,
              })}
              fill="none"
              stroke={trackColor}
              strokeWidth={thickness}
              strokeLinecap="round"
            />
            {track.ratio > 0 && (
              <Path
                d={arcPath({
                  center,
                  radius: track.radius,
                  start: START_ANGLE,
                  end: START_ANGLE + RADIAL_SWEEP * track.ratio,
                })}
                fill="none"
                stroke={track.color}
                strokeWidth={thickness}
                strokeLinecap="round"
              />
            )}
          </Fragment>
        ))}
      </Svg>
    </View>
  );
}

function toPoints(points: Array<{ x: number; y: number }>) {
  return points.map(point => `${point.x},${point.y}`).join(' ');
}

function truncateLabel(label: string) {
  return label.length > RADAR_LABEL_MAX_LENGTH
    ? `${label.slice(0, RADAR_LABEL_MAX_LENGTH - 1)}…`
    : label;
}

/**
 * Radar drawn straight to SVG. gifted-charts' RadarChart puts `translateX`/`translateY`
 * on an SVG group, which react-native-svg forwards to the DOM on web and React then
 * rejects as unknown props — the shared polar helpers here avoid that entirely.
 */
function ChartRadar({ data, chartSize = 240, className, onLayout }: ChartRadarProps) {
  const { isDark, muted } = useThemeColors();
  const gridColor = getAxisColor(isDark);
  const primary = data[0]?.color ?? FALLBACK_SERIES_COLOR;
  const center = chartSize / 2;
  const maxRadius = center - RADAR_LABEL_PADDING;
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const step = FULL_TURN / Math.max(data.length, 1);

  const vertexAt = (index: number, radius: number) =>
    polarPoint({ center, radius, angle: START_ANGLE + index * step });

  const shape = toPoints(
    data.map((item, index) => vertexAt(index, maxRadius * clampRatio(item.value, maxValue))),
  );

  return (
    <View className={cn('w-full items-center', className)} onLayout={onLayout}>
      <Svg width={chartSize} height={chartSize}>
        {RING_RATIOS.map(ratio => (
          <Polygon
            key={`grid-${ratio}`}
            points={toPoints(data.map((_, index) => vertexAt(index, maxRadius * ratio)))}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
            strokeDasharray={GRID_DASH}
          />
        ))}
        {data.map((item, index) => {
          const outer = vertexAt(index, maxRadius);

          return (
            <Line
              key={`axis-${chartItemKey(item)}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke={gridColor}
              strokeWidth={1}
            />
          );
        })}
        <Polygon
          points={shape}
          fill={primary}
          fillOpacity={0.35}
          stroke={primary}
          strokeWidth={2.5}
        />
        {data.map((item, index) => {
          const anchor = vertexAt(index, maxRadius + RADAR_LABEL_FONT_SIZE);
          const horizontal = anchor.x - center;

          return (
            <SvgText
              key={`label-${chartItemKey(item)}`}
              x={anchor.x}
              y={anchor.y + RADAR_LABEL_FONT_SIZE / 3}
              fill={muted}
              fontSize={RADAR_LABEL_FONT_SIZE}
              textAnchor={Math.abs(horizontal) < 4 ? 'middle' : horizontal > 0 ? 'start' : 'end'}
            >
              {truncateLabel(item.label ?? '')}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

/** Single ring with the value in the middle — the "one number" view of a goal. */
function ChartProgressRing({
  value,
  max = 100,
  size = 160,
  thickness = 12,
  color,
  label,
  sublabel,
  className,
}: ChartProgressRingProps) {
  const { isDark } = useThemeColors();
  const trackColor = getTrackColor(isDark);
  const center = size / 2;
  const radius = center - thickness / 2;
  const ratio = clampRatio(value, max);
  const sweep = ratio * MAX_RING_SWEEP;

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ height: size, width: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        {sweep > 0 && (
          <Path
            d={arcPath({ center, radius, start: START_ANGLE, end: START_ANGLE + sweep })}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View className="absolute items-center">
        <Text variant="h3" className="font-bold">
          {label ?? `${Math.round(ratio * 100)}%`}
        </Text>
        {sublabel && (
          <Text variant="caption" className="text-muted-foreground">
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}

export type { ChartPolarAreaProps, ChartProgressRingProps, ChartRadarProps, ChartRadialBarProps };
export { ChartPolarArea, ChartProgressRing, ChartRadar, ChartRadialBar };
