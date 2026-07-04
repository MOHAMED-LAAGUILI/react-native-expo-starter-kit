import BottomSheetLib, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface BottomSheetOption<T> {
  label: string;
  value: T;
}

interface BottomSheetProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: BottomSheetOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function BottomSheetInner<T>({
  open,
  onOpenChange,
  title,
  options,
  selectedValue,
  onSelect,
}: BottomSheetProps<T>) {
  const sheetRef = React.useRef<React.ElementRef<typeof BottomSheetLib>>(null);

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
      snapPoints={["70%"]}
      index={-1}
      enablePanDownToClose
      onChange={index => {
        if (index === -1) onOpenChange(false);
      }}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleComponent={() => (
        <View className="items-center pt-2 pb-1">
          <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </View>
      )}
    >
      <BottomSheetView className="flex-1 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            variant="h4"
            className="flex-1"
          >
            {title}
          </Text>
          <Pressable
            className="p-1 rounded-full active:bg-accent"
            onPress={() => onOpenChange(false)}
            hitSlop={10}
          >
            <X
              size={20}
              className="text-muted-foreground"
            />
          </Pressable>
        </View>
        <View className="border-t border-border bg-card overflow-hidden">
          {options.map((option, index) => (
            <Pressable
              key={String(option.value)}
              className={cn(
                "flex-row items-center justify-between p-4",
                index < options.length - 1 && "border-b border-border",
                selectedValue === option.value && "bg-primary/20"
              )}
              onPress={() => {
                onSelect(option.value);
                onOpenChange(false);
              }}
            >
              <Text variant="body">{option.label}</Text>
              {selectedValue === option.value && <View className="w-2 h-2 rounded-full bg-primary" />}
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetLib>
  );
}

const BottomSheet = React.memo(BottomSheetInner) as typeof BottomSheetInner;

export type { BottomSheetOption, BottomSheetProps };
export { BottomSheet };
