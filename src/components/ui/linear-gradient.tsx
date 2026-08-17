import { LinearGradient } from 'expo-linear-gradient';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type BlushCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type BlushProps = {
  corner: BlushCorner;
  size?: number;
  opacity?: number;
};

const CORNER_OFFSET: Record<BlushCorner, { top?: number; left?: number; right?: number; bottom?: number }> = {
  'top-left': { top: -60, left: -60 },
  'top-right': { top: -60, right: -60 },
  'bottom-left': { bottom: -60, left: -60 },
  'bottom-right': { bottom: -60, right: -60 },
};

const CORNER_GRADIENT: Record<BlushCorner, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  'top-left': { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  'top-right': { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  'bottom-left': { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  'bottom-right': { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } },
};

export function Blush({ corner, size = 380, opacity = 0.5 }: BlushProps) {
  const primaryHex = usePrimaryHex();
  const startOpacity = `${primaryHex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  const gradient = CORNER_GRADIENT[corner];

  return (
    <LinearGradient
      colors={[startOpacity, `${primaryHex}1A`, 'transparent']}
      start={gradient.start}
      end={gradient.end}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        ...CORNER_OFFSET[corner],
      }}
      pointerEvents="none"
    />
  );
}

export type { BlushCorner, BlushProps };
