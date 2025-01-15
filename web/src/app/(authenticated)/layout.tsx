'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/useUserStore';
import { trpc } from '@/lib/trpc';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setUser, clearUser, isAuthenticated } = useUserStore();

  const {
    data: sessionUser,
    error,
    isLoading,
    isFetched,
  } = trpc.user.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      clearUser();
      router.push('/login');
    }
  }, [error, clearUser, router]);

  useEffect(() => {
    if (sessionUser) {
      setUser({
        id: sessionUser.user.id,
        displayName: sessionUser.user.displayName,
        name: sessionUser.user.name,
        image: sessionUser.user.image,
        discriminator: sessionUser.user.discriminator,
      });
    }
  }, [sessionUser, setUser]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated and initial fetch is complete
  if (!isAuthenticated && isFetched) {
    return null;
  }

  return <>{children}</>;
}
