import * as React from 'react';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';
import { isIOS } from '@/utils/platform';

/**
 * On iOS, portal content must render inside a native `FullWindowOverlay` to
 * appear above modals; other platforms need no wrapper. Shared by every
 * portal-based overlay (dropdown, menubar, popover, select, tooltip).
 */
export const FullWindowOverlay = isIOS ? RNFullWindowOverlay : React.Fragment;
