import { usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { NAV_TITLE_MAP } from '@/config/navigation';

const POST_KEY = 'navigation.post';

export function HeaderTitle() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const currentSegment = segments.at(-1);

  const titleKey = pathname.includes('/post/')
    ? POST_KEY
    : NAV_TITLE_MAP[currentSegment ?? 'home'] ?? 'navigation.home';

  return (
    <Text variant="h3" style={{ color: '#fff' }}>
      {t(titleKey)}
    </Text>
  );
}
