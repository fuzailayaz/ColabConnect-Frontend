// src/components/TopBar.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, User as UserIcon, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationList from './notifications/NotificationList';

interface User {
  id: string;
  email?: string; // Make email optional
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
}

interface TopBarProps {
  user: User | null;
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick, user }: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuItems = [
    { label: 'Profile', icon: UserIcon, action: () => router.push('/dashboard/profile') },
    { label: 'Settings', icon: Settings, action: () => router.push('/dashboard/settings') },
    { label: 'Logout', icon: LogOut, action: () => router.push('/auth/login') },
  ];

  return (
    <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects, teams, or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 focus:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 z-50"
                >
                  <NotificationList />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Image
                src={user?.avatar || '/avatar-placeholder.png'}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="hidden md:block font-medium">{user ? user.first_name || 'Guest' : 'Guest'}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 py-2 bg-card rounded-lg shadow-lg border z-50"
                >
                  {userMenuItems.map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={item.action}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
