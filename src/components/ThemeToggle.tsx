'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const iconVariants = {
    initial: { scale: 0.6, rotate: -90 },
    animate: { scale: 1, rotate: 0 },
    exit: { scale: 0.6, rotate: 90 },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        ${isDarkMode 
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode ? 'focus:ring-yellow-500' : 'focus:ring-blue-500'}
      `}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-6 h-6"
        >
          {isDarkMode ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              />
            </svg>
          )}
        </motion.div>
      </AnimatePresence>
      
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>

      <motion.div
        className={`
          absolute inset-0 rounded-lg
          ${isDarkMode ? 'bg-yellow-300' : 'bg-blue-500'}
          opacity-0
        `}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 0.6,
          times: [0, 0.5, 1],
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </motion.button>
  );
}