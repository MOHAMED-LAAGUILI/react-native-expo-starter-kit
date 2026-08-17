import type { TableColumn } from '@/components/ui';
import type { Employee } from '@/data/employees';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Badge,
  Image,
  SectionTitle,
  Table,
  Text,
} from '@/components/ui';
import { employees } from '@/data/employees';
import { isIOS } from '@/utils/platform';

const columns: TableColumn<Employee>[] = [
  {
    id: 'employee',
    header: 'Employee',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
    minWidth: 200,
    cell: (_value, row) => (
      <View className="flex-row items-center gap-3">
        <View className="size-8 items-center justify-center overflow-hidden rounded-full bg-muted">
          {row.avatar
            ? (
                <Image
                  source={{ uri: row.avatar }}
                  className="size-full"
                  style={{ height: '100%', width: '100%' }}
                  contentFit="cover"
                  accessibilityLabel={`${row.name} avatar`}
                  fallback="user"
                />
              )
            : (
                <Text variant="caption" className="font-semibold text-muted-foreground">
                  {row.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </Text>
              )}
        </View>
        <View>
          <Text variant="body" className="font-semibold">{row.name}</Text>
          <Text variant="caption" className="opacity-70">{row.email}</Text>
        </View>
      </View>
    ),
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    sortable: true,
    filterable: true,
    minWidth: 120,
  },
  {
    id: 'salary',
    header: 'Salary',
    accessorKey: 'salary',
    sortable: true,
    align: 'right',
    minWidth: 120,
    cell: value => (
      <Text variant="body" className="font-semibold">
        $
        {value.toLocaleString()}
      </Text>
    ),
  },
  {
    id: 'joinDate',
    header: 'Join Date',
    accessorKey: 'joinDate',
    sortable: true,
    align: 'center',
    minWidth: 120,
    cell: value => new Date(value).toLocaleDateString(),
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    filterable: true,
    align: 'center',
    minWidth: 120,
    cell: value => (
      <Badge
        variant={
          value === 'Active'
            ? 'default'
            : value === 'On Leave'
              ? 'secondary'
              : 'destructive'
        }
      >
        {value}
      </Badge>
    ),
  },
];

function DataTablesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >

      <View className="gap-6 p-6">
        <SectionTitle title="Data & Tables" />
        <SectionTitle title="Sheets, data tables, and list patterns." variant="body" />

        <SectionTitle title="Employee Table" />

        <Table
          data={employees}
          columns={columns}
          pageSize={3}
          searchPlaceholder="Search employees..."
        />
      </View>
    </ScrollView>
  );
}

export { DataTablesScreen };
