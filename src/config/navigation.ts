import type { Href } from 'expo-router';
import { Book, Database, Home, Search, Settings, Smartphone, Sparkles, User } from 'lucide-react-native';

export type NavItem = {
  href: Href;
  icon: typeof Home;
  label: string;
  translationKey: string;
  match: string[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/(app)/(tabs)' as Href,
    icon: Home,
    label: 'Home',
    translationKey: 'navigation.home',
    match: ['/', '/index'],
  },
  {
    href: '/(app)/(tabs)/search' as Href,
    icon: Search,
    label: 'Search',
    translationKey: 'navigation.search',
    match: ['/search'],
  },
  {
    href: '/(app)/(tabs)/profile' as Href,
    icon: User,
    label: 'Profile',
    translationKey: 'navigation.profile',
    match: ['/profile'],
  },
  {
    href: '/(app)/(tabs)/settings' as Href,
    icon: Settings,
    label: 'Settings',
    translationKey: 'navigation.settings',
    match: ['/settings'],
  },
  {
    href: '/(app)/(tabs)/report' as Href,
    icon: Sparkles,
    label: 'Report Graphs',
    translationKey: 'navigation.reportGraphs',
    match: ['/report'],
  },
  {
    href: '/(app)/preferences' as Href,
    icon: Database,
    label: 'Preferences',
    translationKey: 'navigation.preferences',
    match: ['/preferences'],
  },
  {
    href: '/(app)/(tabs)/device-info' as Href,
    icon: Smartphone,
    label: 'Device Info',
    translationKey: 'navigation.deviceInfo',
    match: ['/device-info'],
  },
  {
    href: '/(app)/page-one' as Href,
    icon: Book,
    label: 'Page One',
    translationKey: 'navigation.pageOne',
    match: ['/page-one'],
  },

];
