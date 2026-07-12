import { Text } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { Row } from './typography-and-badge';

function SpinnerDemo() {
  return (
    <Row>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="md" className="text-primary" color="#3b82f6" />
      <Text variant="caption" className="text-muted-foreground">(sm, md, lg, colored)</Text>
    </Row>
  );
}

export { SpinnerDemo };
