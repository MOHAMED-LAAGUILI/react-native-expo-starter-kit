import type * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { queryClient } from '@/api/query-client';

const ReactQueryDevtools = __DEV__
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
