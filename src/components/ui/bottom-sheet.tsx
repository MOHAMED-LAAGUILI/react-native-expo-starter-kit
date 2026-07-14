import BottomSheetLib, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Text } from './text';

type BottomSheetOption<T = string> = {
  label: string;
  value: T;
  leftElement?: React.ReactNode;
};

type BottomSheetProps<T = string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: BottomSheetOption<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
};

function BottomSheetInner<T>(
  { open, onOpenChange, title, options, selectedValue, onSelect, ref }: BottomSheetProps<T> & { ref?: React.Ref<{ expand: () => void; close: () => void }> },
) {
  const bottomSheetRef = React.useRef<BottomSheetLib>(null);
  const { background, muted, border } = useThemeColors();

  React.useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  React.useEffect(() => {
    if (open) {
      bottomSheetRef.current?.expand();
    }
    else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      onPress={() => onOpenChange(false)}
    />
  );

  return (
    <BottomSheetLib
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['25%', '57%']}
      enablePanDownToClose
      enableOverDrag
      animateOnMount
      onChange={index => onOpenChange(index >= 0)}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: border }}
      backgroundStyle={{ backgroundColor: background }}
    >
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text variant="body" className="font-semibold">{title}</Text>
        <Pressable
          onPress={() => onOpenChange(false)}
          className="size-8 items-center justify-center rounded-full bg-muted"
        >
          <X size={16} color={muted} />
        </Pressable>
      </View>

      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onSelect(option.value)}
              className={cn(
                'flex-row items-center gap-3 border-b border-border px-4 py-3',
                isSelected && 'bg-primary/10',
              )}
            >
              {option.leftElement && (
                <View className="items-center justify-center">
                  {option.leftElement}
                </View>
              )}
              <Text variant="body" className={cn('flex-1', isSelected && 'font-semibold text-primary')}>
                {option.label}
              </Text>
              {isSelected && (
                <View className="size-2 rounded-full bg-primary" />
              )}
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetLib>
  );
}

function BottomSheet<T>(
  { ref, ...props }: BottomSheetProps<T> & { ref?: React.Ref<{ expand: () => void; close: () => void }> },
) {
  return <BottomSheetInner {...props} ref={ref} />;
}

export type { BottomSheetOption, BottomSheetProps };
export { BottomSheet };
