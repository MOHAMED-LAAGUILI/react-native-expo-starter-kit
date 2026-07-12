import type { Href } from 'expo-router';
import { Database, Home, Search, Settings, Sparkles, User } from 'lucide-react-native';

export type NavItem = {
  href: Href;
  icon: typeof Home;
  label: string;
  match: string[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/(app)/(tabs)' as Href,
    icon: Home,
    label: 'Home',
    match: ['/', '/index'],
  },
  {
    href: '/(app)/(tabs)/search' as Href,
    icon: Search,
    label: 'Search',
    match: ['/search'],
  },
  {
    href: '/(app)/(tabs)/profile' as Href,
    icon: User,
    label: 'Profile',
    match: ['/profile'],
  },
  {
    href: '/(app)/(tabs)/settings' as Href,
    icon: Settings,
    label: 'Settings',
    match: ['/settings'],
  },
  {
    href: '/(app)/expo-ui' as Href,
    icon: Sparkles,
    label: 'Expo UI',
    match: ['/expo-ui'],
  },
  {
    href: '/(app)/preferences' as Href,
    icon: Database,
    label: 'Preferences',
    match: ['/preferences'],
  },
];
