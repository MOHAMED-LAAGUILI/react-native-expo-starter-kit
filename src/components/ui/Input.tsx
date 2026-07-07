import { Eye, EyeOff, KeyRound, Mail, Phone, Search, User } from "lucide-react-native";
import * as React from "react";
import { Pressable, TextInput, type TextInputProps, View, type ViewStyle } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

type InputType = "email" | "password" | "phone" | "search" | "text" | "username";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  type?: InputType;
}

function Input({ label, error, leftIcon, rightIcon, containerStyle, className, type = "text", ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [secureVisible, setSecureVisible] = React.useState(false);
  const { text, muted } = useThemeColors();
  const iconColor = muted || text;

  const isSecure = type === "password";
  const resolvedSecureTextEntry = isSecure ? !secureVisible : props.secureTextEntry;

  const builtinLeftIcon = React.useMemo(() => {
    const iconProps = { color: iconColor, size: 18 };
    switch (type) {
      case "search":
        return <Search {...iconProps} />;
      case "phone":
        return <Phone {...iconProps} />;
      case "username":
        return <User {...iconProps} />;
      case "password":
        return <KeyRound {...iconProps} />;
      case "email":
        return <Mail {...iconProps} />;
      default:
        return null;
    }
  }, [type, iconColor]);

  const builtinRightIcon = React.useMemo(() => {
    if (!isSecure) return null;
    return (
      <Pressable
        onPress={() => setSecureVisible(v => !v)}
        hitSlop={8}
        className="items-center justify-center"
      >
        {secureVisible ? (
          <EyeOff
            size={18}
            color={iconColor}
          />
        ) : (
          <Eye
            size={18}
            color={iconColor}
          />
        )}
      </Pressable>
    );
  }, [isSecure, secureVisible, iconColor]);

  const showLeftIcon = leftIcon ?? builtinLeftIcon;
  const showRightIcon = isSecure ? builtinRightIcon : rightIcon;

  return (
    <View className={cn("gap-1", containerStyle)}>
      {label ? (
        <Text
          variant="label"
          className="text-muted-foreground mb-0.5"
        >
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          "flex-row items-center rounded-md border h-11 gap-2 px-3",
          "bg-secondary",
          focused ? "border-ring" : "border-border",
          error && "border-destructive"
        )}
      >
        {showLeftIcon && <View className="items-center justify-center">{showLeftIcon}</View>}
        <TextInput
          className={cn("flex-1 text-base text-foreground h-full outline-0", className)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={resolvedSecureTextEntry}
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
        {showRightIcon && <View className="items-center justify-center">{showRightIcon}</View>}
      </View>
      {error ? (
        <Text
          variant="caption"
          className="text-destructive mt-0.5"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export type { InputProps, InputType };
export { Input };
