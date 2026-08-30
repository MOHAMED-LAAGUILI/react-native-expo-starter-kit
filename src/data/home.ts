import type { Href } from 'expo-router';
import type { Layers } from 'lucide-react-native';
import {
  Beaker,
  ChartPie,
  Database,
  FlaskConical,
  LayoutGrid,
  Mountain,
  Music,
  Sparkles,
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
  {
    id: 'test',
    label: 'Test',
    description: 'Waveform, voice notes & demos',
    icon: Beaker,
    href: '/(app)/dev-test' as Href,
    color: '#8b5cf6',
  },
  {
    id: 'blocks',
    label: 'Blocks',
    description: 'Advanced UI blocks & widgets',
    icon: Sparkles,
    href: '/(app)/blocks' as Href,
    color: '#ec4899',
  },
];
