import { View } from 'react-native';

function Divider({ className }: { className?: string }) {
  return <View className={`bg-border mx-4 h-px ${className ?? ''}`} />;
}

export { Divider };
