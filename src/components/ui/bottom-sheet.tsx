import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isIOS } from '@/utils/platform';
import { cn } from '@/utils/utils';
import { Text } from './text';

const FullWindowContainer
  = isIOS
    ? ({ children }: { children?: React.ReactNode }) => (
        <FullWindowOverlay>{children}</FullWindowOverlay>
      )
    : undefined;

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
  bottomSheetRef?: React.Ref<BottomSheetRef>;
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
  const { t } = useTranslation();

  return (
    <View className="border-border flex-row items-center justify-between border-b px-4 py-3">
      <Text variant="body" className="font-semibold">
        {title}
      </Text>

      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        hitSlop={8}
        className="bg-muted size-8 items-center justify-center rounded-full"
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
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'flex-row items-center gap-3 px-4 py-3.5',
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
                isSelected && 'text-primary font-semibold',
              )}
            >
              {option.label}
            </Text>

            {isSelected && (
              <View className="bg-primary size-2 rounded-full" />
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
  const modalRef = React.useRef<React.ComponentRef<typeof BottomSheetModal>>(null);
  const prevOpenRef = React.useRef(open);
  const isPresentedRef = React.useRef(false);
  const { background, muted, border } = useThemeColors();

  // expose imperative API
  React.useImperativeHandle(bottomSheetRef, () => ({
    expand: () => {
      isPresentedRef.current = true;
      modalRef.current?.present();
    },
    close: () => {
      if (isPresentedRef.current)
        modalRef.current?.dismiss();
    },
  }));

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      isPresentedRef.current = true;
      modalRef.current?.present();
    }
    else if (!open && prevOpenRef.current && isPresentedRef.current) {
      isPresentedRef.current = false;
      modalRef.current?.dismiss();
    }
    prevOpenRef.current = open;
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
    <BottomSheetModal
      ref={modalRef}
      index={0}
      stackBehavior="replace"
      snapPoints={snapPoints ?? ['40%', '100%']}
      enableDynamicSizing={enableDynamicSizing}
      enableBlurKeyboardOnGesture
      enableContentPanningGesture
      enableHandlePanningGesture
      enablePanDownToClose
      enableOverDrag
      animateOnMount
      onChange={index => onOpenChange(index >= 0)}
      onDismiss={() => {
        isPresentedRef.current = false;
        onOpenChange(false);
      }}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: border }}
      backgroundStyle={{ backgroundColor: background }}
      containerComponent={FullWindowContainer}
    >
      <BottomSheetHeader
        title={title}
        onClose={() => onOpenChange(false)}
        muted={muted}
      />

      <BottomSheetScrollView contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: 10,
      }}
      >
        {children || (
          <BottomSheetOptions
            options={options}
            selectedValue={selectedValue}
            onSelect={onSelect}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export { BottomSheet };
export type { BottomSheetOption, BottomSheetProps };
