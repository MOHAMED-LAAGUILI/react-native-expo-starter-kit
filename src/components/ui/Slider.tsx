import SliderNative from "@react-native-community/slider";
import * as React from "react";
import { View } from "react-native";
import { COLOR_PALETTES } from "@/config/color-palettes";
import { useThemeColors } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

function Slider({ value, onValueChange, onSlidingComplete, min = 0, max = 100, step = 1, disabled, className }: SliderProps) {
  const primaryColor = useThemeStore(s => s.primaryColor);
  const { border } = useThemeColors();
  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const trackColor = palette?.color ?? "#3b82f6";

  return (
    <View className={cn("h-10 justify-center", className)}>
      <SliderNative
        style={{ height: 40, width: "100%" }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
        minimumTrackTintColor={trackColor}
        maximumTrackTintColor={border}
        thumbTintColor={trackColor}
        tapToSeek
      />
    </View>
  );
}

export type { SliderProps };
export { Slider };
