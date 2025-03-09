"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
  setThemeColor: (color: string) => void;
}

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

const defaultThemes = {
  light: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#818CF8',
    accent: '#A78BFA',
    background: '#111827',
    text: '#F9FAFB',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<Theme>(defaultThemes.light);

  useEffect(() => {
    // Check for system preference and stored preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDarkMode(storedTheme === 'dark' || (!storedTheme && systemPrefersDark));

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDarkMode);
    setTheme(isDarkMode ? defaultThemes.dark : defaultThemes.light);
    
    // Store preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Animate transition
    document.documentElement.style.setProperty(
      '--transition-speed',
      '200ms'
    );
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setThemeColor = (color: string) => {
    setTheme((prev) => ({
      ...prev,
      primary: color,
    }));
    document.documentElement.style.setProperty('--color-primary', color);
  };

  // CSS Variables for dynamic theming
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, setThemeColor }}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for theme-aware colors
export const useThemeColor = (colorKey: keyof Theme) => {
  const { theme } = useTheme();
  return theme[colorKey];
};

// CSS utility classes generator
export const generateThemeColors = () => {
  return `
    :root {
      --transition-speed: 200ms;
      --color-primary: ${defaultThemes.light.primary};
      --color-secondary: ${defaultThemes.light.secondary};
      --color-accent: ${defaultThemes.light.accent};
      --color-background: ${defaultThemes.light.background};
      --color-text: ${defaultThemes.light.text};
    }

    .dark {
      --color-primary: ${defaultThemes.dark.primary};
      --color-secondary: ${defaultThemes.dark.secondary};
      --color-accent: ${defaultThemes.dark.accent};
      --color-background: ${defaultThemes.dark.background};
      --color-text: ${defaultThemes.dark.text};
    }

    * {
      transition: background-color var(--transition-speed) ease-in-out,
                  border-color var(--transition-speed) ease-in-out,
                  color var(--transition-speed) ease-in-out;
    }
  `;
};

export default ThemeContext;
