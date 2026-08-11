import type { ActionSheetProps } from '@/components/ui/action-sheet';
import { useState } from 'react';

type ActionSheetConfig = Omit<ActionSheetProps, 'visible' | 'onClose'>;

export function useActionSheet() {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<ActionSheetConfig>({
    options: [],
  });

  const show = (actionSheetConfig: ActionSheetConfig) => {
    setConfig(actionSheetConfig);
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  return {
    show,
    hide,
    isVisible,
    config,
  };
}
