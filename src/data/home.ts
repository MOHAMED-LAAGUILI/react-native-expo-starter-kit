import type { Href } from 'expo-router';
import type { Layers } from 'lucide-react-native';
import {
  BarChart3,
  ChartPie,
  Database,
  FlaskConical,
  LayoutGrid,
  Mountain,
  Music,
} from 'lucide-react-native';

export type CategoryCard = {
  id: string;
  label: string;
  description: string;
  icon: typeof Layers;
  href: Href;
  color: string;
};

export const CATEGORIES: CategoryCard[] = [
  {
    id: 'ui',
    label: 'UI Components',
    description: 'Buttons, inputs, badges & more',
    icon: LayoutGrid,
    href: '/(app)/dev-ui' as Href,
    color: '#3b82f6',
  },
  {
    id: 'forms',
    label: 'Forms & Inputs',
    description: 'OTP, date pickers, action sheets',
    icon: FlaskConical,
    href: '/(app)/dev-forms' as Href,
    color: '#10b981',
  },
  {
    id: 'media',
    label: 'Media & Audio',
    description: 'Camera, audio, video & gallery',
    icon: Music,
    href: '/(app)/dev-media' as Href,
    color: '#f59e0b',
  },
  {
    id: 'data',
    label: 'Data & Tables',
    description: 'Tables, sheets & lists',
    icon: Database,
    href: '/(app)/dev-data' as Href,
    color: '#06b6d4',
  },
  {
    id: 'charts',
    label: 'Charts',
    description: 'Line, bar, radar & more',
    icon: BarChart3,
    href: '/(app)/charts' as Href,
    color: '#ef4444',
  },
  {
    id: 'parallax',
    label: 'Parallax',
    description: 'Parallax scroll & animations',
    icon: Mountain,
    href: '/(app)/parallax' as Href,
    color: '#64748b',
  },
  {
    id: 'report',
    label: 'Report Graphs',
    description: 'Charts, KPIs & summaries',
    icon: ChartPie,
    href: '/(app)/(tabs)/report' as Href,
    color: '#f97316',
  },
];
