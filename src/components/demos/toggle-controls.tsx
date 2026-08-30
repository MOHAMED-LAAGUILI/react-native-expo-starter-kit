import * as React from 'react';
import { View } from 'react-native';
import { Checkbox, Switch, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function SwitchDemo() {
  const [on, setOn] = React.useState(false);
  const [on2, setOn2] = React.useState(false);
  const [on3, setOn3] = React.useState(false);
  const [on4, setOn4] = React.useState(false);
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
      <Row>
        <Switch checked={on4} onCheckedChange={setOn4} variant="gooey" size="sm" />
        <Switch checked={on4} onCheckedChange={setOn4} variant="gooey" />
        <Switch checked={on4} onCheckedChange={setOn4} variant="gooey" size="lg" />
        <Text variant="caption" className="text-muted-foreground">gooey (sm / md / lg)</Text>
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
