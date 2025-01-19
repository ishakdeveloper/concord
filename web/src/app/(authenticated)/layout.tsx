'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only count non-background fetches
  const isFetching = useIsFetching({
    predicate: (query) => {
      // Don't show loading for background refreshes
      if (
        query.state.fetchStatus === 'fetching' &&
        query.state.status === 'success'
      ) {
        return false;
      }
      return true;
    },
  });

  // Only count visible mutations
  const isMutating = useIsMutating({
    predicate: (mutation) => {
      return mutation.state.status === 'pending';
    },
  });

  const isLoading = isFetching > 0 || isMutating > 0;

  return (
    <div className="relative">
      <div className={isLoading ? 'pointer-events-none' : ''}>{children}</div>
    </div>
  );
}
