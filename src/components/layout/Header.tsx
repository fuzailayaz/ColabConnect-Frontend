// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, User as UserIcon, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationList from '../notifications/NotificationList';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { UserProfile } from '@/utils/userProfile';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { Tables } from '@/types/database';
import { ComponentType } from 'react';


type NotificationType = Tables<'notifications'>;
type ProfileType = Tables<'profiles'>;

type UserProfileWithAuth = ProfileType & { email: string | null };

interface HeaderProps {
  user: UserProfileWithAuth | null; // Expect the combined profile type
  notifications: NotificationType[]; // Expect the Supabase notification type array
  openModal: (component: ComponentType<any>, props?: any) => void;
  onMenuClick: () => void;
}


export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const userMenuItems = [
    { 
      label: 'Profile', 
      icon: UserIcon, 
      action: () => {
        setShowUserMenu(false);
        router.push('/dashboard/profile');
      }
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      action: () => {
        setShowUserMenu(false);
        router.push('/dashboard/settings');
      }
    },
    { 
      label: 'Logout', 
      icon: LogOut, 
      action: handleLogout
    },
  ];

  return (
    <header 
      className="fixed top-0 left-0 w-full shadow-md z-50"
      style={{ 
        backgroundColor: theme.card,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href="/dashboard/home" className="text-xl font-semibold" style={{ color: theme.text }}>
          CollabConnect
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 relative">
          <div 
            className="flex items-center rounded-lg px-3 py-2"
            style={{ 
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`
            }}
          >
            <Search size={20} className="opacity-50" style={{ color: theme.text }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 w-full outline-none bg-transparent"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:opacity-80 transition-colors relative"
              style={{ backgroundColor: theme.hover }}
            >
              <Bell size={20} style={{ color: theme.text }} />
              {unreadCount > 0 && (
                <span 
                  className="absolute top-0 right-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden"
                  style={{ 
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <NotificationList 
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:opacity-80 transition-colors"
              style={{ backgroundColor: theme.hover }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <UserIcon size={20} className="text-white" />
                  </div>
                )}
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50"
                  style={{ 
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  {userMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full flex items-center space-x-2 px-4 py-3 hover:opacity-80 transition-colors text-left"
                        style={{ color: theme.text }}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}