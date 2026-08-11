import { Activity, DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react-native';

export type DemoSheetCard = {
  title: string;
  value: string;
  subtitle: string;
};

export const DEMO_CARDS: DemoSheetCard[] = [
  { title: 'Aujourd\'hui', value: '66.00 DH', subtitle: '2 commandes' },
  { title: 'Total des ventes', value: '66.00 DH', subtitle: '2 Total des commandes' },
  { title: 'Stock', value: '2', subtitle: 'Disponibilité du stock' },
  { title: 'Stock bas', value: '1', subtitle: 'Produits à reconstituer' },
];

export type CardItem = {
  id: number;
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  variant?: 'primary' | 'stats' | 'compact';
};

export const cardListData: CardItem[] = [
  {
    id: 1,
    title: 'Revenue',
    value: '$12,450',
    subtitle: '+15% from last month',
    icon: DollarSign,
    variant: 'primary',
  },
  {
    id: 2,
    title: 'Orders',
    value: '1,234',
    subtitle: '23 pending',
    icon: ShoppingCart,
    variant: 'stats',
  },
  {
    id: 3,
    title: 'Products',
    value: '456',
    subtitle: '12 low stock',
    icon: Package,
    variant: 'stats',
  },
  {
    id: 4,
    title: 'Customers',
    value: '892',
    subtitle: '+45 new this week',
    icon: Users,
    variant: 'stats',
  },
  {
    id: 5,
    title: 'Growth',
    value: '+23%',
    subtitle: 'Year over year',
    icon: TrendingUp,
    variant: 'primary',
  },
  {
    id: 6,
    title: 'Activity',
    value: 'High',
    subtitle: 'Last 24 hours',
    icon: Activity,
    variant: 'stats',
  },
];

export type CardData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  orientation: 'vertical' | 'horizontal';
};

export const VERTICAL_CARDS: CardData[] = [
  { title: 'Mountain', subtitle: 'Adventure awaits', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop', orientation: 'vertical' },
  { title: 'Ocean', subtitle: 'Deep blue', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop', orientation: 'vertical' },
  { title: 'Forest', subtitle: 'Nature\'s path', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop', orientation: 'vertical' },
];

export const HORIZONTAL_CARDS: CardData[] = [
  { title: 'City Lights', subtitle: 'Urban exploration', imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=200&fit=crop', orientation: 'horizontal' },
  { title: 'Sunset', subtitle: 'Golden hour', imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=200&fit=crop', orientation: 'horizontal' },
  { title: 'Desert', subtitle: 'Sand dunes', imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=200&fit=crop', orientation: 'horizontal' },
];
