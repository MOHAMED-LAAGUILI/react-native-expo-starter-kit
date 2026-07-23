import { Text } from '@/components/ui';

function SectionHeader({ label, className }: { label: string; className?: string }) {
  return (
    <Text
      variant="label"
      className={`text-muted-foreground mb-3 tracking-wider uppercase ${className ?? ''}`}
    >
      {label}
    </Text>
  );
}

export { SectionHeader };
