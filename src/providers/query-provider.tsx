import type * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { queryClient } from '@/api/query-client';
import { isWeb } from '@/utils/platform';

// The devtools panel renders DOM elements (`div`), so it only works on web.
// Opt-in: its floating button sits in a screen corner and covers app controls
// (the tab bar, onboarding's next button). Set EXPO_PUBLIC_QUERY_DEVTOOLS=1
// in .env.development to show it.
const SHOW_QUERY_DEVTOOLS = __DEV__ && isWeb && process.env.EXPO_PUBLIC_QUERY_DEVTOOLS === '1';
const ReactQueryDevtools = SHOW_QUERY_DEVTOOLS
  ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
  : null;

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && <ReactQueryDevtools client={queryClient} initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export { QueryProvider };
