import * as React from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text, type ViewStyle } from "react-native";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  title,
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-md gap-2",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-6",
        size === "lg" && "h-12 px-8",
        variant === "primary" && "bg-primary active:bg-primary/90",
        variant === "secondary" && "bg-secondary active:bg-secondary/80",
        variant === "outline" && "border border-border bg-background active:bg-accent",
        variant === "ghost" && "active:bg-accent",
        variant === "destructive" && "bg-destructive active:bg-destructive/90",
        disabled && "opacity-50",
        pressed && !disabled && "opacity-80",
        className
      )}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "destructive" ? "#ffffff" : undefined}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            className={cn(
              "font-semibold",
              variant === "primary" && "text-primary-foreground dark:text-white",
              variant === "secondary" && "text-secondary-foreground",
              variant === "outline" && "text-foreground",
              variant === "ghost" && "text-foreground",
              variant === "destructive" && "text-destructive-foreground",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-lg"
            )}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

export type { ButtonProps, ButtonSize, ButtonVariant };
export { Button };
