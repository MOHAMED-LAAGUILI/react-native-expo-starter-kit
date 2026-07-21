import { Text } from '@/components/ui';

function SectionHeader({ label, className }: { label: string; className?: string }) {
  return (
    <Text
      variant="label"
      className={`mb-3 tracking-wider text-muted-foreground uppercase ${className ?? ''}`}
    >
      {label}
    </Text>
  );
}

export { SectionHeader };
