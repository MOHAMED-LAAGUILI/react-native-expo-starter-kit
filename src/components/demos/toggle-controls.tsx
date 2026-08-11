import * as React from 'react';
import { View } from 'react-native';
import { Checkbox, Switch, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function SwitchDemo() {
  const [on, setOn] = React.useState(false);
  return (
    <Row>
      <View className="flex-row items-center gap-3">
        <Switch checked={on} onCheckedChange={setOn} />
        <Text variant="body">{on ? 'On' : 'Off'}</Text>
      </View>
      <Switch checked={true} onCheckedChange={() => {}} disabled />
      <Text variant="caption" className="text-muted-foreground">disabled (on)</Text>
    </Row>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(false);
  return (
    <Row>
      <View className="flex-row items-center gap-3">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <Text variant="body">{checked ? 'Checked' : 'Unchecked'}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Checkbox checked={true} onCheckedChange={() => {}} disabled />
        <Text variant="caption" className="text-muted-foreground">disabled</Text>
      </View>
    </Row>
  );
}

export { CheckboxDemo, SwitchDemo };
