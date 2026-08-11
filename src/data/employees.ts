export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  avatar?: string;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
};

export const employees: Employee[] = [
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
