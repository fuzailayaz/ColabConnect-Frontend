"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/TopBar';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import the AuthContext

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth(); // Get the user from AuthContext

  useEffect(() => {
    setIsMounted(true);
    const checkScreenSize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleMenuClick = () => {
    setIsCollapsed(!isCollapsed); // Toggle sidebar collapse
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={isCollapsed} 
        onClose={() => setIsCollapsed(!isCollapsed)} 
      />
      
      <motion.main
        initial={false}
        animate={{
          marginLeft: isCollapsed ? '72px' : '240px',
          width: isCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 240px)',
        }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        <TopBar 
          onMenuClick={handleMenuClick} 
          user={user as any} // Type assertion to any
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}