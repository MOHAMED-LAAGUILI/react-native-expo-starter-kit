import { View } from 'react-native';

function Divider({ className }: { className?: string }) {
  return <View className={`mx-4 h-px bg-border ${className ?? ''}`} />;
}

export { Divider };
