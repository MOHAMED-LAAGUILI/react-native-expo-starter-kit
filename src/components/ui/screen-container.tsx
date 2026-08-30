import type { ScrollViewProps } from 'react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIOS } from '@/utils/platform';

type ContainerProps = Omit<ScrollViewProps, 'contentInset' | 'contentContainerStyle'> & {
  children: React.ReactNode;
};

export function ScreenContainer({ children, contentContainerClassName, ...props }: ContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      <View className={contentContainerClassName ?? 'gap-6 p-6'}>
        {children}
      </View>
    </ScrollView>
  );
}
