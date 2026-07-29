import BottomSheetLib, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
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

export type BottomSheetRef = {
  expand: () => void;
  close: () => void;
};

type BottomSheetProps<T = string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: React.ReactNode;
  options?: BottomSheetOption<T>[];
  selectedValue?: T;
  onSelect?: (value: T) => void;
  snapPoints?: string[];
  enableDynamicSizing?: boolean;
  bottomSheetRef?: React.Ref<BottomSheetRef>; // ✅ React 19 style
};

/* ----------------------------- Header ----------------------------- */

function BottomSheetHeader({
  title,
  onClose,
  muted,
}: {
  title: string;
  onClose: () => void;
  muted: string;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
      <Text variant="body" className="font-semibold">
        {title}
      </Text>

      <Pressable
        onPress={onClose}
        className="size-8 items-center justify-center rounded-full bg-muted"
      >
        <X size={16} color={muted} />
      </Pressable>
    </View>
  );
}

/* ----------------------------- Options ----------------------------- */

function BottomSheetOptions<T>({
  options,
  selectedValue,
  onSelect,
}: {
  options?: BottomSheetOption<T>[];
  selectedValue?: T;
  onSelect?: (value: T) => void;
}) {
  return (
    <>
      {options?.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect?.(option.value)}
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

            <Text
              variant="body"
              className={cn(
                'flex-1',
                isSelected && 'font-semibold text-primary',
              )}
            >
              {option.label}
            </Text>

            {isSelected && (
              <View className="size-2 rounded-full bg-primary" />
            )}
          </Pressable>
        );
      })}
    </>
  );
}

/* ----------------------------- Main ----------------------------- */

function BottomSheet<T>({
  open,
  onOpenChange,
  title,
  children,
  options,
  selectedValue,
  onSelect,
  snapPoints,
  enableDynamicSizing,
  bottomSheetRef,
}: BottomSheetProps<T>) {
  const sheetRef = React.useRef<BottomSheetLib>(null);
  const prevOpenRef = React.useRef(open);
  const { background, muted, border } = useThemeColors();

  // expose imperative API
  React.useImperativeHandle(bottomSheetRef, () => ({
    expand: () => sheetRef.current?.expand(),
    close: () => sheetRef.current?.close(),
  }));

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      sheetRef.current?.expand();
    }
    else if (!open && prevOpenRef.current) {
      sheetRef.current?.close();
    }
    prevOpenRef.current = open;
  }, [open]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={() => onOpenChange(false)}
      />
    ),
    [onOpenChange],
  );

  return (
    <BottomSheetLib
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints ?? ['30%', '60%']}
      enableDynamicSizing={enableDynamicSizing}
      enableBlurKeyboardOnGesture
      enableContentPanningGesture
      enableHandlePanningGesture
      enablePanDownToClose
      enableOverDrag
      animateOnMount
      onChange={index => onOpenChange(index >= 0)}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: border }}
      backgroundStyle={{ backgroundColor: background }}
    >
      <BottomSheetHeader
        title={title}
        onClose={() => onOpenChange(false)}
        muted={muted}
      />

      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {children || (
          <BottomSheetOptions
            options={options}
            selectedValue={selectedValue}
            onSelect={onSelect}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetLib>
  );
}

export { BottomSheet };
export type { BottomSheetOption, BottomSheetProps };
