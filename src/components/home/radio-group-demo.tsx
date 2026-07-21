import * as React from 'react';
import { View } from 'react-native';
import { RadioGroup, RadioGroupItem } from '@/components/ui';

function RadioGroupDemo() {
  const [fruit, setFruit] = React.useState('apple');
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <RadioGroup value={fruit} onValueChange={setFruit}>
        <RadioGroupItem value="apple" label="Apple" />
        <RadioGroupItem value="banana" label="Banana" />
        <RadioGroupItem value="orange" label="Orange" />
      </RadioGroup>
    </View>
  );
}

export { RadioGroupDemo };
