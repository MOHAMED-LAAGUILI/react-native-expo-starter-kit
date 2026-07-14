import { usePathname } from 'expo-router';
import { Text } from '@/components/ui';

export function HeaderTitle() {
  const pathname = usePathname();

  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const currentSegment = segments.at(-1);

  const title = pathname.includes('/post/')
    ? 'Post'
    : currentSegment === 'report'
      ? 'Report Graphs'
      : currentSegment === 'preferences'
        ? 'Preferences'
        : currentSegment === 'search'
          ? 'Search'
          : currentSegment === 'profile'
            ? 'Profile'
            : currentSegment === 'settings'
              ? 'Settings'
              : 'Home';

  return (
    <Text
      variant="h3"
      style={{ color: '#fff' }}
    >
      {title}
    </Text>
  );
}
