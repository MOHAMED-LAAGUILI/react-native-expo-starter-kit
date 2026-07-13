import { View } from 'react-native';
import { Progress } from '@/components/ui';

function ProgressDemo() {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <Progress value={30} />
      <Progress value={65} />
      <Progress value={100} />
    </View>
  );
}

export { ProgressDemo };
