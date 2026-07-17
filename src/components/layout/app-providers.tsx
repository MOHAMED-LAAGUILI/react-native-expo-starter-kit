import type { ReactNode } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderButtonsProvider } from 'react-navigation-header-buttons/HeaderButtonsProvider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { isWeb } from '@/utils/platform';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <HeaderButtonsProvider stackType={isWeb ? 'js' : 'native'}>
          <QueryProvider>
            <BottomSheetModalProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </BottomSheetModalProvider>
          </QueryProvider>
        </HeaderButtonsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
