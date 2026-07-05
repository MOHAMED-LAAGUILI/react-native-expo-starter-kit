import * as React from "react";
import { TextInput, type TextInputProps, View, type ViewStyle } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

function Input({ label, error, leftIcon, rightIcon, containerStyle, className, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View className={cn("gap-1", containerStyle)}>
      {label ? <Text variant="label" className="text-muted-foreground mb-0.5">{label}</Text> : null}
      <View
        className={cn(
          "flex-row items-center rounded-md border h-11",
          "bg-secondary",
          focused ? "border-ring" : "border-border",
          error && "border-destructive"
        )}
      >
           {leftIcon && (
            <View className="h-9 w-8 items-center justify-center border-r border-border">
              {leftIcon}
            </View>
          )}
        <TextInput
          className={cn(
            "flex-1 text-base text-foreground px-3 h-full outline-0 ms-2",
            leftIcon && "pl-1",
            rightIcon && "pr-1",
            className
          )}
          placeholderTextColor="#9CA3AF"
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon ? <View className="pr-3">{rightIcon}</View> : null}
      </View>
      {error ? <Text variant="caption" className="text-destructive mt-0.5">{error}</Text> : null}
    </View>
  );
}

export type { InputProps };
export { Input };
