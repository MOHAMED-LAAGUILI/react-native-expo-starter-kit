import type { ReactNode } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView className="bg-background flex-1">
      <SafeAreaProvider>
        <QueryProvider>
          <BottomSheetModalProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </BottomSheetModalProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
