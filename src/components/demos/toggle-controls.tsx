import * as React from 'react';
import { View } from 'react-native';
import { Checkbox, Switch, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function SwitchDemo() {
  const [on, setOn] = React.useState(false);
  const [on2, setOn2] = React.useState(false);
  const [on3, setOn3] = React.useState(false);
  return (
    <View className="gap-4">
      <Row>
        <View className="flex-row items-center gap-3">
          <Switch checked={on} onCheckedChange={setOn} />
          <Text variant="body">{on ? 'On' : 'Off'}</Text>
        </View>
        <Switch checked={true} onCheckedChange={() => {}} disabled />
        <Text variant="caption" className="text-muted-foreground">disabled (on)</Text>
      </Row>
      <Row>
        <View className="flex-row items-center gap-3">
          <Switch checked={on2} onCheckedChange={setOn2} variant="liquid-glass" />
          <Text variant="body">Liquid Glass</Text>
        </View>
      </Row>
      <Row>
        <View className="flex-row items-center gap-3">
          <Switch checked={on3} onCheckedChange={setOn3} variant="square" />
          <Text variant="body">Square</Text>
        </View>
      </Row>
    </View>
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
