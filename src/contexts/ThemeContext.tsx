"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  input: string | undefined;
  primaryForeground: string | undefined;
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  sidebar: string;
  card: string;
  border: string;
  hover: string;
}

// Light Theme
const lightTheme: Theme = {
  mode: 'light',
  primary: '#22C55E', // Green for buttons
  secondary: '#F2F2F7',
  accent: '#4AA8FF',
  background: '#FFFFFF',
  text: '#1C1C1E',
  textMuted: '#8E8E93',
  sidebar: '#F2F2F7',
  card: '#FFFFFF',
  border: '#D1D1D6',
  hover: '#E5E5EA',
  input: '#FFFFFF',
  primaryForeground: '#FFFFFF'
};

// Dark Theme with specified colors
const darkTheme: Theme = {
  mode: 'dark',
  primary: '#22C55E',                 // Tailwind green-500 for buttons
  secondary: '#1C1C1C',               // Sidebar or slightly lighter bg
  accent: '#4AA8FF',                  // Blue highlight for code/keywords
  background: '#0F0F0F',              // Main dark background (very dark gray/black)
  text: '#E0E0E0',                    // Primary white-ish text
  textMuted: '#A3A3A3',               // Muted gray text
  sidebar: '#1C1C1C',                 // Sidebar background (#1c1c1c – #202020)
  card: '#1E1E1E',                    // Editor/Card background
  border: '#2C2C2C',                  // Divider/border lines
  hover: '#2C2C2C',                   // Hover state background
  input: '#1E1E1E',                   // Input background
  primaryForeground: '#FFFFFF'        // Text on primary buttons
};

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = (savedTheme === 'dark' || (!savedTheme && prefersDark)) ? 'dark' : 'light';

    if (initialMode === 'dark') {
      setTheme(darkTheme);
      document.documentElement.classList.add('dark');
    } else {
      setTheme(lightTheme);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newMode = prevTheme.mode === 'light' ? 'dark' : 'light';
      const newTheme = newMode === 'light' ? lightTheme : darkTheme;
      localStorage.setItem('theme', newMode);
      document.documentElement.classList.toggle('dark', newMode === 'dark');
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
