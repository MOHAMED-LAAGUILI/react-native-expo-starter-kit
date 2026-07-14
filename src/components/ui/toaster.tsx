import { toast } from '@backpackapp-io/react-native-toast';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastProps = {
  variant?: ToastVariant;
  title: string;
  message?: string;
};

export function showToast({ variant = 'info', title, message }: ToastProps) {
  const text = message ? `${title}\n${message}` : title;

  switch (variant) {
    case 'success':
      toast.success(text);
      break;

    case 'error':
      toast.error(text);
      break;
    default:
      toast.loading(text, {
        duration: 2000,
      });
      break;
  }
}
