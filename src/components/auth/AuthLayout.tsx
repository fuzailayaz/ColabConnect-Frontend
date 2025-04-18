'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

export default function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1b1e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#313338] via-[#1a1b1e] to-[#1a1b1e] opacity-80" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] opacity-5 bg-cover bg-center filter blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(49,51,56,0.5)_0%,rgba(26,27,30,0.8)_100%)]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[90%] mx-auto sm:max-w-md lg:max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/logo.svg"
            alt="Logo"
            className="mx-auto h-14 w-auto drop-shadow-lg"
          />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 text-4xl font-bold text-white tracking-tight sm:text-5xl"
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 text-lg text-gray-400"
          >
            {mode === 'login' 
              ? 'Sign in to your account to continue'
              : 'Start your journey with us today'}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <div className="bg-[#25262b] backdrop-blur-lg py-8 px-6 shadow-2xl ring-1 ring-gray-800 rounded-2xl sm:px-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800/5 to-transparent pointer-events-none" />
            <div className="relative space-y-6">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}