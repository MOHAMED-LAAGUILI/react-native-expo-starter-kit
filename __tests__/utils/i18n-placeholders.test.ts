/**
 * Placeholder parity used by `pnpm run i18n:check` (script/check-locale-parity.ts).
 */
import { formatSet, placeholdersByStem, placeholdersOf, sameSet } from '../../script/lib/i18n-placeholders';

const stem = (key: string) => key.replace(/_(?:zero|one|two|few|many|other)$/, '');

describe('placeholdersOf', () => {
  it('finds interpolations, ignoring format and spacing', () => {
    expect([...placeholdersOf('Hi {{name}}, you have {{ count, number }} items')]).toEqual(['{{name}}', '{{count}}']);
  });

  it('finds $t() nesting', () => {
    expect([...placeholdersOf('$t(common.app) — {{version}}')]).toEqual(['{{version}}', '$t(common.app)']);
  });

  it('returns nothing for plain text', () => {
    expect(placeholdersOf('Plain text').size).toBe(0);
  });
});

describe('placeholdersByStem', () => {
  it('counts plural forms of one key together', () => {
    const values = new Map<string, unknown>([
      ['items_one', 'one item'],
      ['items_other', '{{count}} items'],
      ['title', 'Title'],
      ['nested', 42],
    ]);
    const byStem = placeholdersByStem(values, stem);
    expect(formatSet(byStem.get('items')!)).toBe('{{count}}');
    expect(byStem.get('title')!.size).toBe(0);
    expect(byStem.has('nested')).toBe(false);
  });
});

describe('sameSet / formatSet', () => {
  it('compares regardless of order', () => {
    expect(sameSet(new Set(['{{a}}', '{{b}}']), new Set(['{{b}}', '{{a}}']))).toBe(true);
    expect(sameSet(new Set(['{{a}}']), new Set(['{{a}}', '{{b}}']))).toBe(false);
  });

  it('prints an empty set as none', () => {
    expect(formatSet(new Set())).toBe('none');
  });
});
