import { Home } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Row } from './typography-and-badge';

function ButtonsDemo() {
  return (
    <>
      <Text variant="label" className="mb-1 text-muted-foreground">Variants</Text>
      <Row>
        <Button title="Primary" variant="primary" size="sm" />
        <Button title="Secondary" variant="secondary" size="sm" />
        <Button title="Outline" variant="outline" size="sm" />
        <Button title="Ghost" variant="ghost" size="sm" />
        <Button title="Destructive" variant="destructive" size="sm" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">Sizes</Text>
      <Row>
        <Button title="Small" size="sm" />
        <Button title="Medium" size="md" />
        <Button title="Large" size="lg" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">States</Text>
      <Row>
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <Button
          title="With Icon"
          variant="outline"
          leftIcon={color => <Home size={16} color={color} />}
        />
      </Row>
    </>
  );
}

export { ButtonsDemo };
