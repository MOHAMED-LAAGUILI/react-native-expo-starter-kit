import type { Href } from 'expo-router';
import {
  BarChart3,
  Database,
  FlaskConical,
  Home,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  StepForward,
  User,
} from 'lucide-react-native';

export type NavItem = {
  href: Href;
  icon: typeof Home;
  label: string;
  translationKey: string;
  match: string[];
  segment: string;
  tab?: {
    name: string;
    icon: typeof Home;
    order: number;
  };
};

const BASE_NAV_ITEMS: NavItem[] = [
  {
    href: '/(app)/(tabs)' as Href,
    icon: Home,
    label: 'Home',
    translationKey: 'navigation.home',
    match: ['/', '/index'],
    segment: 'home',
    tab: { name: 'index', icon: Home, order: 2 },
  },
  {
    href: '/(app)/(tabs)/search' as Href,
    icon: Search,
    label: 'Search',
    translationKey: 'navigation.search',
    match: ['/search'],
    segment: 'search',
    tab: { name: 'search', icon: Search, order: 0 },
  },
  {
    href: '/(app)/(tabs)/profile' as Href,
    icon: User,
    label: 'Profile',
    translationKey: 'navigation.profile',
    match: ['/profile'],
    segment: 'profile',
  },
  {
    href: '/(app)/(tabs)/settings' as Href,
    icon: Settings,
    label: 'Settings',
    translationKey: 'navigation.settings',
    match: ['/settings'],
    segment: 'settings',
    tab: { name: 'settings', icon: Settings, order: 3 },
  },
  {
    href: '/(app)/(tabs)/report' as Href,
    icon: Sparkles,
    label: 'Report Graphs',
    translationKey: 'navigation.reportGraphs',
    match: ['/report'],
    segment: 'report',
    tab: { name: 'report', icon: BarChart3, order: 1 },
  },
  {
    href: '/(app)/(tabs)/device-info' as Href,
    icon: Smartphone,
    label: 'Device Info',
    translationKey: 'navigation.deviceInfo',
    match: ['/device-info'],
    segment: 'device-info',
    tab: { name: 'device-info', icon: Smartphone, order: 4 },
  },
  {
    href: '/(app)/dev-onboarding' as Href,
    icon: StepForward,
    label: 'Onboarding',
    translationKey: 'navigation.onboarding',
    match: ['/dev-onboarding'],
    segment: 'dev-onboarding',
  },
  {
    href: '/(app)/dev-test' as Href,
    icon: FlaskConical,
    label: 'Test',
    translationKey: 'navigation.test',
    match: ['/dev-test'],
    segment: 'dev-test',
  },
];

const DEV_NAV_ITEMS: NavItem[] = [
  {
    href: '/(app)/dev-preferences' as Href,
    icon: Database,
    label: 'Preferences',
    translationKey: 'navigation.preferences',
    match: ['/dev-preferences'],
    segment: 'dev-preferences',
  },

];

// Final export
export const NAV_ITEMS: NavItem[] = __DEV__
  ? [...BASE_NAV_ITEMS, ...DEV_NAV_ITEMS]
  : BASE_NAV_ITEMS;

export const NAV_TITLE_MAP: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map(item => [item.segment, item.translationKey]),
);

export const NAV_TAB_ITEMS = NAV_ITEMS.filter(
  (item): item is NavItem & { tab: NonNullable<NavItem['tab']> } => !!item.tab,
);
