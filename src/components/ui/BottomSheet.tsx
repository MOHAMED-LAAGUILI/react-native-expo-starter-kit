import BottomSheetLib, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import * as React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

const ITEM_HEIGHT = 56;
const HEADER_HEIGHT = 88;
const HANDLE_HEIGHT = 24;
const EXTRA_PADDING = 16;

interface BottomSheetOption<T> {
  label: string;
  value: T;
  leftElement?: React.ReactNode;
}

interface BottomSheetProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: BottomSheetOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function BottomSheetInner<T>({ open, onOpenChange, title, options, selectedValue, onSelect }: BottomSheetProps<T>) {
  const sheetRef = React.useRef<React.ElementRef<typeof BottomSheetLib>>(null);
  const { height: screenHeight } = useWindowDimensions();

  const snapPoints = React.useMemo(() => {
    const contentHeight = ITEM_HEIGHT * options.length + HEADER_HEIGHT + HANDLE_HEIGHT + EXTRA_PADDING;
    const snapPercent = Math.max(25, Math.min(55, (contentHeight / screenHeight) * 100));
    return [`${snapPercent}%`, "80%"];
  }, [options.length, screenHeight]);

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  return (
    <BottomSheetLib
      ref={sheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      enableOverDrag
      onChange={index => {
        if (index === -1) onOpenChange(false);
      }}
      backgroundComponent={() => <View className="flex-1 bg-card rounded-3xl" />}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleComponent={() => (
        <View className="items-center pt-3 pb-2 bg-card rounded-t-3xl">
          <View className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
        </View>
      )}
    >
      <BottomSheetScrollView
        className="flex-1 px-4 bg-card"
        bounces={false}
      >
        <View className="flex-row items-center justify-between mb-4 pt-1">
          <Text
            variant="h4"
            className="flex-1"
          >
            {title}
          </Text>
          <Pressable
            className="p-1 rounded-full active:bg-accent"
            onPress={() => onOpenChange(false)}
          >
            <X
              size={20}
              className="text-muted-foreground"
            />
          </Pressable>
        </View>
        <View className="border-t border-border bg-card overflow-hidden rounded-b-xl">
          {options.map((option, index) => (
            <Pressable
              key={String(option.value)}
              className={cn(
                "flex-row items-center px-4 py-4",
                index < options.length - 1 && "border-b border-border",
                selectedValue === option.value && "bg-primary/20"
              )}
              onPress={() => {
                onSelect(option.value);
                onOpenChange(false);
              }}
            >
              {option.leftElement}
              <Text
                variant="body"
                className="flex-1"
              >
                {option.label}
              </Text>
              {selectedValue === option.value && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </Pressable>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheetLib>
  );
}

const BottomSheet = React.memo(BottomSheetInner) as typeof BottomSheetInner;

export type { BottomSheetOption, BottomSheetProps };
export { BottomSheet };
