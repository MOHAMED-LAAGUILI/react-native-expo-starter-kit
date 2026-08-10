import type { ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
} from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';

// Types
export type TableColumn<T = any> = {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  cell?: (value: any, row: T) => ReactNode;
  headerCell?: () => ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type TableProps<T = any> = {
  data: T[];
  columns: TableColumn<T>[];
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
  onRowPress?: (row: T, index: number) => void;
  sortable?: boolean;
  filterable?: boolean;
};

type SortDirection = 'asc' | 'desc' | null;

type SortState = {
  column: string | null;
  direction: SortDirection;
};

type TableStateParams<T> = {
  data: T[];
  columns: TableColumn<T>[];
  pagination: boolean;
  pageSize: number;
  filterable: boolean;
  sortable: boolean;
};

function useTableState<T>({
  data,
  columns,
  pagination,
  pageSize,
  filterable,
  sortable,
}: TableStateParams<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  let processedData = [...data];

  if (searchQuery && filterable) {
    processedData = processedData.filter(row =>
      columns.some((column) => {
        if (!column.filterable)
          return false;
        const value = (row as any)[column.accessorKey];
        return String(value || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    );
  }

  if (sortState.column && sortState.direction && sortable) {
    processedData.sort((a, b) => {
      const aValue = (a as any)[sortState.column!];
      const bValue = (b as any)[sortState.column!];

      if (aValue === null || aValue === undefined)
        return 1;
      if (bValue === null || bValue === undefined)
        return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortState.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue)
        return sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue)
        return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const filteredAndSortedData = processedData;

  const totalPages = pagination
    ? Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize))
    : 1;
  const startIndex = pagination ? (currentPage - 1) * pageSize : 0;
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + (pagination ? pageSize : filteredAndSortedData.length),
  );

  const handleSort = (columnId: string) => {
    if (!sortable)
      return;

    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable)
      return;

    setSortState((prev) => {
      if (prev.column === columnId) {
        const newDirection: SortDirection
          = prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc';

        return {
          column: newDirection ? columnId : null,
          direction: newDirection,
        };
      }
      else {
        return { column: columnId, direction: 'asc' };
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage,
    searchQuery,
    setSearchQuery,
    sortState,
    filteredAndSortedData,
    totalPages,
    paginatedData,
    handleSort,
    handlePageChange,
  };
}

function renderSortIcon({
  columnId,
  columns,
  sortState,
  sortable,
  muted,
  primaryHex,
}: {
  columnId: string;
  columns: TableColumn<any>[];
  sortState: SortState;
  sortable: boolean;
  muted: string;
  primaryHex: string;
}) {
  if (!sortable)
    return null;

  const column = columns.find(col => col.id === columnId);
  if (!column?.sortable)
    return null;

  if (sortState.column !== columnId) {
    return <ChevronUp size={16} color={muted} style={{ opacity: 0.3 }} />;
  }

  return sortState.direction === 'asc'
    ? <ChevronUp size={16} color={primaryHex} />
    : <ChevronDown size={16} color={primaryHex} />;
}

function TableHeader<T>({
  columns,
  sortState,
  onSort,
  sortable,
  headerStyle,
}: {
  columns: TableColumn<T>[];
  sortState: SortState;
  onSort: (columnId: string) => void;
  sortable: boolean;
  headerStyle?: ViewStyle;
}) {
  const { muted } = useThemeColors();
  const primaryHex = usePrimaryHex();

  return (
    <View
      style={[headerStyle]}
      className="flex-row border-b border-border bg-card"
    >
      {columns.map(column => (
        <TouchableOpacity
          key={column.id}
          style={{
            flex: column.width ? 0 : 1,
            width: column.width as any,
            minWidth: column.minWidth || 100,
            justifyContent:
              column.align === 'center'
                ? 'center'
                : column.align === 'right'
                  ? 'flex-end'
                  : 'flex-start',
          }}
          className="flex-row items-center p-4"
          onPress={() => onSort(column.id)}
          disabled={!column.sortable || !sortable}
          accessibilityRole={column.sortable && sortable ? 'button' : undefined}
          accessibilityLabel={
            column.sortable && sortable
              ? `${column.header}, ${
                sortState.column === column.id
                  ? sortState.direction === 'asc'
                    ? 'sorted ascending'
                    : 'sorted descending'
                  : 'not sorted'
              }`
              : column.header
          }
        >
          {column.headerCell
            ? column.headerCell()
            : (
                <>
                  <Text
                    variant="body"
                    className="font-semibold text-muted-foreground"
                    style={{
                      marginRight: column.sortable && sortable ? 4 : 0,
                      textAlign: column.align || 'left',
                    }}
                  >
                    {column.header}
                  </Text>
                  {renderSortIcon({
                    columnId: column.id,
                    columns,
                    sortState,
                    sortable,
                    muted,
                    primaryHex,
                  })}
                </>
              )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TableCell<T>({
  column,
  row,
  cellStyle,
}: {
  column: TableColumn<T>;
  row: T;
  cellStyle?: ViewStyle;
}) {
  const value = (row as any)[column.accessorKey];
  const cellContent = column.cell
    ? column.cell(value, row)
    : String(value || '');

  const alignStyle: TextStyle = {
    textAlign: column.align || 'left',
  };

  return (
    <View
      style={[
        {
          flex: column.width ? 0 : 1,
          width: column.width as any,
          minWidth: column.minWidth || 100,
          justifyContent: 'center',
        },
        cellStyle,
      ]}
      className="p-4"
    >
      {typeof cellContent === 'string'
        ? <Text style={alignStyle}>{cellContent}</Text>
        : cellContent}
    </View>
  );
}

function TableRow<T>({
  columns,
  row,
  index,
  onRowPress,
  rowStyle,
  cellStyle,
}: {
  columns: TableColumn<T>[];
  row: T;
  index: number;
  onRowPress?: (row: T, index: number) => void;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      style={[rowStyle]}
      className="flex-row border-b border-border bg-card"
      onPress={() => onRowPress?.(row, index)}
      disabled={!onRowPress}
      activeOpacity={onRowPress ? 0.7 : 1}
    >
      {columns.map(column => (
        <TableCell key={column.id} column={column} row={row} cellStyle={cellStyle} />
      ))}
    </TouchableOpacity>
  );
}

function TablePagination({
  currentPage,
  totalPages,
  total,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-t border-border bg-card p-4">
      <Text variant="caption">
        Page
        {' '}
        {currentPage}
        {' '}
        of
        {' '}
        {totalPages}
        {' '}
        (
        {total}
        {' '}
        total)
      </Text>

      <View className="flex-row items-center gap-2">
        <Button
          title="First page"
          iconOnly
          variant="outline"
          size="sm"
          leftIconComponent={ChevronsLeft}
          onPress={() => onPageChange(1)}
          disabled={currentPage === 1}
        />

        <Button
          title="Previous page"
          iconOnly
          variant="outline"
          size="sm"
          leftIconComponent={ChevronLeft}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        <Button
          title="Next page"
          iconOnly
          variant="outline"
          size="sm"
          leftIconComponent={ChevronRight}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />

        <Button
          title="Last page"
          iconOnly
          variant="outline"
          size="sm"
          leftIconComponent={ChevronsRight}
          onPress={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </View>
    </View>
  );
}

function TableSearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="border-b border-border bg-card px-4 py-2">
      <Input
        type="search"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
}

function TableMessage({ children }: { children: ReactNode }) {
  return (
    <View className="items-center justify-center bg-card p-8">
      <Text variant="body" className="text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}

export function Table<T = any>({
  data,
  columns,
  pagination = true,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data available',
  style,
  headerStyle,
  rowStyle,
  cellStyle,
  onRowPress,
  sortable = true,
  filterable = true,
}: TableProps<T>) {
  const {
    currentPage,
    searchQuery,
    setSearchQuery,
    sortState,
    filteredAndSortedData,
    totalPages,
    paginatedData,
    handleSort,
    handlePageChange,
  } = useTableState({ data, columns, pagination, pageSize, filterable, sortable });

  return (
    <View
      style={[style]}
      className="w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      {searchable && filterable
        ? (
            <TableSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
            />
          )
        : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            sortable={sortable}
            headerStyle={headerStyle}
          />

          {loading
            ? <TableMessage>Loading...</TableMessage>
            : paginatedData.length === 0
              ? <TableMessage>{emptyMessage}</TableMessage>
              : (
                  <FlatList
                    data={paginatedData}
                    keyExtractor={(_, index) => String(index)}
                    renderItem={({ item, index }) => (
                      <TableRow
                        columns={columns}
                        row={item}
                        index={index}
                        onRowPress={onRowPress}
                        rowStyle={rowStyle}
                        cellStyle={cellStyle}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                )}
        </View>
      </ScrollView>

      {pagination && totalPages > 1
        ? (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={filteredAndSortedData.length}
              onPageChange={handlePageChange}
            />
          )
        : null}
    </View>
  );
}
