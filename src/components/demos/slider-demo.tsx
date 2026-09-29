import * as React from 'react';
import { View } from 'react-native';
import { Slider, Text } from '@/components/ui';

function SliderDemo() {
  const [value, setValue] = React.useState(50);
  const [verticalValue, setVerticalValue] = React.useState(30);
  const [lockedValue, setLockedValue] = React.useState(65);

  return (
    <View className="gap-4">
      <View className="border-border bg-card rounded-xl border p-4">
        <Text variant="label" className="text-muted-foreground mb-1">Horizontal</Text>
        <Slider value={value} onValueChange={setValue} min={0} max={100} />
        <Text variant="body" className="mt-2 text-center">{`Value: ${value}`}</Text>
      </View>
      <View className="border-border bg-card rounded-xl border p-4">
        <Text variant="label" className="text-muted-foreground mb-1">Vertical</Text>
        <Slider
          orientation="vertical"
          value={verticalValue}
          onValueChange={setVerticalValue}
          min={0}
          max={100}
        />
        <Text variant="body" className="mt-2 text-center">{`Value: ${verticalValue}`}</Text>
      </View>
      <View className="border-border bg-card rounded-xl border p-4">
        <Text variant="label" className="text-muted-foreground mb-1">Disabled</Text>
        <Slider value={lockedValue} onValueChange={setLockedValue} min={0} max={100} disabled />
        <Text variant="body" className="mt-2 text-center">{`Value: ${lockedValue}`}</Text>
      </View>
    </View>
  );
}

export { SliderDemo };
