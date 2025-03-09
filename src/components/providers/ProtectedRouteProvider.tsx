'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/LoadingState';

export default function ProtectedRouteProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '/'; // ✅ Ensures pathname is always a string

  useEffect(() => {
    const publicPaths = ['/auth/login', '/auth/register'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
