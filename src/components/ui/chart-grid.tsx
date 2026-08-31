import type { ChartDataItem } from './chart';
import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { Text } from './text';

type ChartHeatmapRow = {
  label: string;
  values: number[];
};

type ChartHeatmapProps = {
  data: ChartHeatmapRow[];
  /** Column headings; also fixes how many cells a row can show. */
  columns: string[];
  color: string;
  /** Captions for the intensity ramp. Omit them to show the swatches on their own. */
  scaleLabels?: { less: string; more: string };
  className?: string;
};

type ChartTreemapProps = {
  data: ChartDataItem[];
  height?: number;
  className?: string;
};

type TreemapItem = {
  color: string;
  label: string;
  share: number;
  value: number;
};

/** Empty cells still need to read as cells, so intensity never drops to fully transparent. */
const MIN_INTENSITY = 0.08;
const LEGEND_STEPS = [0.1, 0.3, 0.5, 0.75, 1];
/** Below this share a tile is too small to fit its caption without clipping. */
const MIN_LABELLED_SHARE = 0.07;

function intensity(value: number, max: number) {
  if (max <= 0) {
    return MIN_INTENSITY;
  }

  return MIN_INTENSITY + (1 - MIN_INTENSITY) * Math.min(Math.max(value / max, 0), 1);
}

function sumValues(items: TreemapItem[]) {
  return items.reduce((total, item) => total + item.value, 0);
}

/** Calendar-style grid where colour weight stands in for the value of each cell. */
function ChartHeatmap({ data, columns, color, scaleLabels, className }: ChartHeatmapProps) {
  const max = Math.max(...data.flatMap(row => row.values), 1);

  return (
    <View className={cn('w-full gap-2', className)}>
      <View className="flex-row items-center gap-1">
        <View className="w-8" />
        {columns.map(column => (
          <Text
            key={`column-${column}`}
            variant="caption"
            className="flex-1 text-center text-muted-foreground"
          >
            {column}
          </Text>
        ))}
      </View>

      {data.map(row => (
        <View key={`row-${row.label}`} className="flex-row items-center gap-1">
          <Text variant="caption" className="w-8 text-muted-foreground">
            {row.label}
          </Text>
          {columns.map((column, index) => (
            <View
              key={`cell-${row.label}-${column}`}
              className="flex-1 rounded-md"
              style={{
                aspectRatio: 1,
                backgroundColor: color,
                opacity: intensity(row.values[index] ?? 0, max),
              }}
            />
          ))}
        </View>
      ))}

      <View className="flex-row items-center justify-end gap-1.5">
        {scaleLabels && (
          <Text variant="caption" className="text-muted-foreground">
            {scaleLabels.less}
          </Text>
        )}
        {LEGEND_STEPS.map(step => (
          <View
            key={`legend-${step}`}
            className="size-3 rounded-sm"
            style={{ backgroundColor: color, opacity: step }}
          />
        ))}
        {scaleLabels && (
          <Text variant="caption" className="text-muted-foreground">
            {scaleLabels.more}
          </Text>
        )}
      </View>
    </View>
  );
}

function TreemapTile({ item }: { item: TreemapItem }) {
  return (
    <View
      className="flex-1 justify-end overflow-hidden rounded-lg p-2"
      style={{ backgroundColor: item.color }}
    >
      {item.share >= MIN_LABELLED_SHARE && item.label !== '' && (
        <>
          <Text numberOfLines={1} className="text-[11px]/[15px] font-semibold text-white">
            {item.label}
          </Text>
          <Text numberOfLines={1} className="text-[10px]/[14px] text-white/80">
            {item.value}
            h
          </Text>
        </>
      )}
    </View>
  );
}

/**
 * Slice-and-dice layout: split the (descending) items into two halves of roughly
 * equal weight, alternate the split direction, recurse. Pure flex, so it needs no
 * measurement and lays out identically on native and web.
 */
function TreemapBranch({ items, horizontal }: { items: TreemapItem[]; horizontal: boolean }) {
  const [first] = items;

  if (items.length <= 1) {
    return first ? <TreemapTile item={first} /> : null;
  }

  const total = sumValues(items);
  let running = 0;
  let splitAt = 0;

  while (splitAt < items.length - 1 && running + items[splitAt].value <= total / 2) {
    running += items[splitAt].value;
    splitAt += 1;
  }

  const cut = Math.max(splitAt, 1);
  const head = items.slice(0, cut);
  const tail = items.slice(cut);
  const headTotal = sumValues(head);

  return (
    <View className="flex-1 gap-1" style={{ flexDirection: horizontal ? 'row' : 'column' }}>
      <View style={{ flex: headTotal }}>
        <TreemapBranch items={head} horizontal={!horizontal} />
      </View>
      <View style={{ flex: Math.max(total - headTotal, 1) }}>
        <TreemapBranch items={tail} horizontal={!horizontal} />
      </View>
    </View>
  );
}

/** Nested rectangles sized by value — good for showing how a total splits up. */
function ChartTreemap({ data, height = 220, className }: ChartTreemapProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const items: TreemapItem[] = [...data]
    .sort((a, b) => b.value - a.value)
    .map(item => ({
      color: item.color,
      label: item.label ?? '',
      share: total === 0 ? 0 : item.value / total,
      value: item.value,
    }));

  if (items.length === 0) {
    return null;
  }

  return (
    <View
      className={cn('w-full overflow-hidden rounded-xl', className)}
      style={{ height }}
    >
      <TreemapBranch items={items} horizontal />
    </View>
  );
}

export type { ChartHeatmapProps, ChartHeatmapRow, ChartTreemapProps };
export { ChartHeatmap, ChartTreemap };
