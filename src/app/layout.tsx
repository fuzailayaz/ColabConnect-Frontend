'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AIModalProvider } from '@/contexts/AIModalContext';
import { ToastProvider } from '@/components/ui/use-toast';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('🔄 RootLayout Rendered');
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <AIModalProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </AIModalProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
