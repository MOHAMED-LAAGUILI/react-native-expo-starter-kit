import { Home, Save } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function ButtonsDemo() {
  return (
    <>
      <Text variant="label" className="text-muted-foreground mb-1">Variants</Text>
      <Row>
        <Button title="Primary" variant="primary" size="sm" />
        <Button title="Secondary" variant="secondary" size="sm" />
        <Button title="Outline" variant="outline" size="sm" />
        <Button title="Ghost" variant="ghost" size="sm" />
        <Button title="Destructive" variant="destructive" size="sm" />
        <Button title="Success" variant="success" size="sm" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Sizes</Text>
      <Row>
        <Button title="Small" size="sm" />
        <Button title="Medium" size="md" />
        <Button title="Large" size="lg" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">States</Text>
      <Row>
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <Button title="Home" variant="outline" leftIconComponent={Home} />
        <Button title="Save" variant="primary" leftIconComponent={Save} />
      </Row>
    </>
  );
}

export { ButtonsDemo };
