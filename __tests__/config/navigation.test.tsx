import { NAV_ITEMS, NAV_TAB_ITEMS, NAV_TITLE_MAP } from '@/config/navigation';
import en from '@/i18n/locales/en/common.json';

/** Resolve a dotted i18n key ("navigation.home") against the English common namespace. */
function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], en);
}

describe('navigation config', () => {
  it('gives every tab a unique order and name', () => {
    const orders = NAV_TAB_ITEMS.map(item => item.tab.order);
    const names = NAV_TAB_ITEMS.map(item => item.tab.name);
    expect(new Set(orders).size).toBe(orders.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every item a unique segment', () => {
    const segments = NAV_ITEMS.map(item => item.segment);
    expect(new Set(segments).size).toBe(segments.length);
  });

  it('maps every segment to a translation key that exists in English', () => {
    const missing = Object.entries(NAV_TITLE_MAP).filter(([, key]) => typeof lookup(key) !== 'string');
    expect(missing).toEqual([]);
  });

  it('includes dev-only screens in development builds', () => {
    expect(NAV_ITEMS.some(item => item.segment === 'dev-preferences')).toBe(__DEV__);
  });
});
