import { cn } from '@/utils/cn';

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('flex-1', false, undefined, null, 'p-4')).toBe('flex-1 p-4');
  });

  it('applies conditional classes from objects', () => {
    expect(cn('px-2', { 'bg-primary/10': true, 'opacity-50': false })).toBe('px-2 bg-primary/10');
  });

  it('lets the later Tailwind utility win on conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm text-muted-foreground', 'text-lg')).toBe('text-muted-foreground text-lg');
  });
});
