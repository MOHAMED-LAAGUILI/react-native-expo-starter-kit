import type { TableColumn } from '@/components/test/table';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/test/sheet';
import { Table } from '@/components/test/table';
import { Badge, Button, Image, Text } from '@/components/ui';

type SheetDemoProps = {
  side: 'left' | 'right';
  title: string;
  description: string;
};

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  avatar?: string;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
};
const employees: Employee[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    department: 'Engineering',
    salary: 95000,
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    joinDate: '2022-01-15',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.c@company.com',
    department: 'Design',
    salary: 78000,
    joinDate: '2023-03-20',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.d@company.com',
    department: 'Marketing',
    salary: 65000,
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    joinDate: '2021-11-08',
    status: 'On Leave',
  },
  {
    id: 4,
    name: 'James Wilson',
    email: 'james.w@company.com',
    department: 'Sales',
    salary: 72000,
    joinDate: '2020-09-12',
    status: 'Terminated',
  },
];
const columns: TableColumn<Employee>[] = [
  {
    id: 'employee',
    header: 'Employee',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
    minWidth: 200,
    cell: (value, row) => (
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
          <Text variant="body" className="font-semibold">
            {row.name}
          </Text>
          <Text variant="caption" className="opacity-70">
            {row.email}
          </Text>
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

function SheetDemo({ side, title, description }: SheetDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} side={side}>
      <SheetTrigger>
        {side === 'right' ? 'Open Right Sheet' : 'Open Left Sheet'}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <View className="gap-4 px-6">
          <Text>
            This themed side sheet slides in from the edge with a spring-like
            animation and a fading backdrop.
          </Text>
          <Button
            title="Close Sheet"
            onPress={() => setOpen(false)}
            className="rounded-full"
          />
        </View>
      </SheetContent>
    </Sheet>
  );
}

export function TestScreen2() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      contentInset={{ bottom: insets.bottom }}
    >
      <View className="gap-8 p-6">
        <View>
          <Text variant="h2">Test Screen 2</Text>
          <Text className="mt-1 text-muted-foreground">
            Demonstrates the themed side Sheet component.
          </Text>
        </View>

        <SheetDemo
          side="right"
          title="Right Sheet"
          description="Slides in from the right edge of the screen."
        />
        <SheetDemo
          side="left"
          title="Left Sheet"
          description="Slides in from the left edge of the screen."
        />

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
