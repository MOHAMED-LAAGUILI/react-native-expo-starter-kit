import * as React from "react";
import { View } from "react-native";
import RNToast from "react-native-toast-message";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
}

function ToastConfig() {
  return (
    <RNToast
      visibilityTime={3000}
      position="top"
      topOffset={60}
    />
  );
}

function showToast({ variant = "info", title, message }: ToastProps) {
  RNToast.show({
    text1: title,
    text2: message,
    type: variant,
  });
}

export type { ToastProps, ToastVariant };
export { showToast, ToastConfig };
