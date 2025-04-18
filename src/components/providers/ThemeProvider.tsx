'use client';

import { useState, useEffect } from 'react';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
    setTheme(savedTheme || systemTheme);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={theme} style={{ colorScheme: theme }}>
      {children}
    </div>
  );
}