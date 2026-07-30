import * as React from 'react';
import { View } from 'react-native';
import { Slider, Text } from '@/components/ui';

function SliderDemo() {
  const [value, setValue] = React.useState(50);
  return (
    <View className="border-border bg-card rounded-xl border p-4">
      <Slider value={value} onValueChange={setValue} min={0} max={100} />
      <Text variant="body" className="mt-2 text-center">
        Value:
        {value}
      </Text>
    </View>
  );
}

export { SliderDemo };
