import { toast } from '@backpackapp-io/react-native-toast';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastProps = {
  variant?: ToastVariant;
  title: string;
  message?: string;
};

export const toastDefaultStyle = {
  indicator: {
    alignSelf: 'stretch' as const,
    borderRadius: 2,
    marginRight: 12,
    width: 3,
  },
  pressable: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5ea',
    borderRadius: 10,
    borderWidth: 0.5,
  },
  text: {
    color: '#1c1c1e',
    fontWeight: '600' as const,
  },
  view: {
    overflow: 'hidden' as const,
    paddingLeft: 0,
  },
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

export { toast };
