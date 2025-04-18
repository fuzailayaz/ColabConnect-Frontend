'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="text-red-500">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}