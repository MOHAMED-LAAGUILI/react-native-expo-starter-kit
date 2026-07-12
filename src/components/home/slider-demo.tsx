import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { Slider } from '@/components/ui/slider';

function SliderDemo() {
  const [value, setValue] = React.useState(50);
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <Slider value={value} onValueChange={setValue} min={0} max={100} />
      <Text variant="body" className="mt-2 text-center">
        Value:
        {value}
      </Text>
    </View>
  );
}

export { SliderDemo };
