import { AccessibilityInfo } from 'react-native';
import { Toast } from 'react-native-toast-message-ts';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type ToastProps = {
  variant?: ToastVariant;
  title: string;
  message?: string;
};

export function showToast({ variant = 'info', title, message }: ToastProps) {
  Toast.show({
    type: variant,
    text1: title,
    text2: message,
    visibilityTime: 2000,
  });

  // Announce to screen readers — toasts are visual-only otherwise (WCAG 4.1.3 / 2.2)
  const announcement = message ? `${title}: ${message}` : title;
  AccessibilityInfo.announceForAccessibility(announcement);
}
