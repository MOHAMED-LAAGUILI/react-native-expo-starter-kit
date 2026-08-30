import * as React from 'react';
import { View } from 'react-native';
import { Slider, Text } from '@/components/ui';

function SliderDemo() {
  const [value, setValue] = React.useState(50);
  const [verticalValue, setVerticalValue] = React.useState(30);
  const [lockedValue, setLockedValue] = React.useState(65);

  return (
    <View className="gap-4">
      <View className="rounded-xl border border-border bg-card p-4">
        <Text variant="label" className="mb-1 text-muted-foreground">Horizontal</Text>
        <Slider value={value} onValueChange={setValue} min={0} max={100} />
        <Text variant="body" className="mt-2 text-center">{`Value: ${value}`}</Text>
      </View>
      <View className="rounded-xl border border-border bg-card p-4">
        <Text variant="label" className="mb-1 text-muted-foreground">Vertical</Text>
        <Slider
          orientation="vertical"
          value={verticalValue}
          onValueChange={setVerticalValue}
          min={0}
          max={100}
        />
        <Text variant="body" className="mt-2 text-center">{`Value: ${verticalValue}`}</Text>
      </View>
      <View className="rounded-xl border border-border bg-card p-4">
        <Text variant="label" className="mb-1 text-muted-foreground">Disabled</Text>
        <Slider value={lockedValue} onValueChange={setLockedValue} min={0} max={100} disabled />
        <Text variant="body" className="mt-2 text-center">{`Value: ${lockedValue}`}</Text>
      </View>
    </View>
  );
}

export { SliderDemo };
