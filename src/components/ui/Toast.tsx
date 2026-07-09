import { toast } from "@backpackapp-io/react-native-toast";
import * as React from "react";
import { useThemeStore } from "@/store";

export type ToastVariant = "success" | "error" | "info";
const themeMode = useThemeStore(s => s.mode);

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
}

const isDark = themeMode === "dark";

export const toastDefaultStyle = React.useMemo(
  () => ({
    indicator: {
      alignSelf: "stretch" as const,
      borderRadius: 2,
      marginRight: 12,
      width: 4,
    },
    pressable: {
      backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
      borderColor: isDark ? "#333333" : "#e5e5ea",
      borderRadius: 10,
      borderWidth: 0.5,
    },
    text: {
      color: isDark ? "#f2f2f2" : "#1c1c1e",
      fontWeight: "600" as const,
    },
    view: {
      overflow: "hidden" as const,
      paddingLeft: 0,
    },
  }),
  [isDark]
);

export function showToast({ variant = "info", title, message }: ToastProps) {
  const text = message ? `${title}\n${message}` : title;

  switch (variant) {
    case "success":
      toast.success(text);
      break;

    case "error":
      toast.error(text);
      break;

    case "info":
    default:
      toast(text);
      break;
  }
}

export { toast };
