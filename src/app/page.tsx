// src/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if not already redirecting to prevent loops
    if (!redirecting && !isLoading) {
      setRedirecting(true);
      console.log('🔄 Home page redirecting, user state:', user ? 'logged in' : 'not logged in');
      
      // If user is logged in, go to dashboard, otherwise to login
      const targetPath = user ? '/dashboard/home' : '/auth/login';
      router.push(targetPath);
    }
  }, [router, user, isLoading, redirecting]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to CollabConnect</h1>
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to {user ? 'dashboard' : 'login'}...</p>
        </div>
      </div>
    </div>
  );
}