'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import superjson from 'superjson';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useToast } from '@/hooks/use-toast';

export default function TrpcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error, _query) => {
            toast({
              title: 'Error',
              description:
                'An error occurred: ' +
                (error instanceof Error ? error.message : 'Unknown error'),
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _query) => {
            toast({
              title: 'Error',
              description:
                'An error occurred: ' +
                (error instanceof Error ? error.message : 'Unknown error'),
            });
          },
        }),
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
