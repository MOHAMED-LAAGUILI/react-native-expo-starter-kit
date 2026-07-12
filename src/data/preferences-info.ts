import { STORAGE_KEYS } from '@/config/constants';

const KEY_LABELS: Record<string, string> = {
  [STORAGE_KEYS.AUTH_TOKEN]: 'Auth Token',
  [STORAGE_KEYS.AUTH_REFRESH_TOKEN]: 'Auth Refresh Token',
  [STORAGE_KEYS.AUTH_USER]: 'Auth User',
  [STORAGE_KEYS.LANGUAGE]: 'Language',
  [STORAGE_KEYS.ONBOARDING_COMPLETE]: 'Onboarding Complete',
  [STORAGE_KEYS.PRIMARY_COLOR]: 'Primary Color',
  [STORAGE_KEYS.THEME_MODE]: 'Theme Mode',
};

type Entry = {
  key: string;
  label: string;
  value: string;
  store: string;
};

export { KEY_LABELS };
export type { Entry };
