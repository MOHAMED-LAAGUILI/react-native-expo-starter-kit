import type { ReactNode } from 'react';
import type { ChartContainerLegendItem } from '@/components/ui';
import { View } from 'react-native';
import { ChartContainer } from '@/components/ui';
import { useChartReady } from '@/hooks/use-chart-ready';

/**
 * Tiles are laid out by flex-basis rather than a breakpoint: one per row while the
 * row is narrower than two tiles, side by side as soon as it isn't. Works the same
 * on a phone, a tablet in landscape and a desktop browser.
 */
const TILE_BASIS = 300;

type GalleryTileProps = {
  title: string;
  subtitle?: string;
  /** Position among the tiles of the active category — staggers when the chart mounts. */
  order: number;
  /** Height of the placeholder skeleton; match it to the chart it stands in for. */
  height?: number;
  legend?: ChartContainerLegendItem[];
  children: ReactNode;
};

function GalleryTile({ title, subtitle, order, height = 220, legend, children }: GalleryTileProps) {
  const ready = useChartReady(order);

  return (
    <View style={{ flexBasis: TILE_BASIS, flexGrow: 1, flexShrink: 1 }}>
      <ChartContainer
        title={title}
        subtitle={subtitle}
        legend={legend}
        loading={!ready}
        height={height}
      >
        {children}
      </ChartContainer>
    </View>
  );
}

export type { GalleryTileProps };
export { GalleryTile };
