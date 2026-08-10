import type { ActionSheetProps } from './action-sheet';
import { useState } from 'react';
import { ActionSheet } from './action-sheet';

export function useActionSheet() {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<
    Omit<ActionSheetProps, 'visible' | 'onClose'>
  >({
    options: [],
  });

  const show = (actionSheetConfig: Omit<ActionSheetProps, 'visible' | 'onClose'>) => {
      setConfig(actionSheetConfig);
      setIsVisible(true);
    };

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    show,
    hide,
    ActionSheet: <ActionSheet visible={isVisible} onClose={hide} {...config} />,
    isVisible,
  };
}
