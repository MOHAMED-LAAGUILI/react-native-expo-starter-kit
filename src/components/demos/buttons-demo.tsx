import { Home, Save, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';
import { Badge, Blush, Button, Text } from '@/components/ui';
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
        <Button title="Gradient" variant="primary-gradient" size="sm" />
        <Button title="Shadcn" variant="shadcn" size="sm" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Effects (press and hold)</Text>
      <Row>
        <Button title="Gooey" variant="outline" effect="gooey" size="sm" />
        <Button title="Ripple" variant="secondary" effect="ripple" size="sm" />
        <Button title="Both" variant="primary" effect="both" size="sm" />
      </Row>
      <Row>
        <Button title="Press me" variant="outline" effect="gooey" size="lg" />
        <Button title="Blob border" variant="outline" effect="gooey" disabled />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Glass (blurs whatever is behind it)</Text>
      <View className="border-border relative overflow-hidden rounded-2xl border p-4">
        <Blush corner="top-left" size={260} opacity={0.9} />
        <Blush corner="bottom-right" size={220} opacity={0.7} />
        <Row>
          <Button title="Glass" variant="glass" size="sm" />
          <Button title="Glass gooey" variant="glass" effect="gooey" size="sm" />
          <Badge variant="glass" icon={Sparkles}>Glass badge</Badge>
        </Row>
      </View>

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
