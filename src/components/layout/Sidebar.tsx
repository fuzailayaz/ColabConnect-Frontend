// src/components/layout/Sidebar.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import useMediaQuery from "@/hooks/useMediaQuery";
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  HelpCircle,
  Brain,
  TrendingUp,
  Award,
  Bell,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
  openModal: (component: React.ComponentType<any>, props?: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleMouseEnter = () => !isOpen && setIsExpanded(true);
  const handleMouseLeave = () => !isOpen && setIsExpanded(false);
  
  const menuItems = [
    // Main navigation
    { path: '/dashboard/home', label: 'Dashboard', icon: Home },
    { path: '/dashboard/projects', label: 'Projects', icon: Briefcase },
    { path: '/dashboard/teams', label: 'Teams', icon: Users },
    { path: '/dashboard/collaborators', label: 'Collaborators', icon: Users },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    
    // Analytics & AI
    { path: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: Brain },
    { path: '/dashboard/skills', label: 'Skills', icon: Award },
    { path: '/dashboard/learning', label: 'Learning Hub', icon: BookOpen },
    { path: '/dashboard/trends', label: 'Trends', icon: TrendingUp },
    
    // Support & Settings
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    { path: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  ];
  
  // Group menu items for better organization
  const mainNavItems = menuItems.slice(0, 6);
  const analyticsItems = menuItems.slice(6, 10);
  const supportItems = menuItems.slice(10);

  return (
    <aside 
      className={`fixed left-0 top-0 h-full ${
        isMobile ? (isOpen ? 'w-64' : 'w-0') : 
        (isExpanded ? 'w-64' : 'w-16')
      } pt-16 transition-all duration-300 z-20`}
      style={{
        transition: 'width 0.3s ease',
        backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#F2F2F7',
        borderRight: `1px solid ${theme.border}`
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 relative h-full overflow-y-auto">
        {/* Main Navigation */}
        <div className="mb-6">
          <h2 
            className={`text-lg font-semibold mb-3 ${isExpanded ? 'block' : 'hidden'}`}
            style={{ color: theme.text }}
          >
            Main Menu
          </h2>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="flex items-center p-3 rounded-md transition-all duration-300 relative group"
                    style={{ 
                      backgroundColor: isActive ? (theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA') : 'transparent',
                      color: isActive ? theme.primary : theme.text
                    }}
                  >
                    <Icon className="h-5 w-5 min-w-[20px]" />
                    <span className={`ml-3 ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'} transition-opacity duration-300`}>{item.label}</span>
                    {isActive && (
                      <div 
                        className={`ml-auto h-2 w-2 rounded-full ${isExpanded ? 'block' : 'hidden'}`}
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Analytics & AI */}
        <div className="mb-6">
          <h2 
            className={`text-lg font-semibold mb-3 ${isExpanded ? 'block' : 'hidden'}`}
            style={{ color: theme.text }}
          >
            Analytics & AI
          </h2>
          <ul className="space-y-1">
            {analyticsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="flex items-center p-3 rounded-md transition-all duration-300 relative group"
                    style={{ 
                      backgroundColor: isActive ? (theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA') : 'transparent',
                      color: isActive ? theme.primary : theme.text
                    }}
                  >
                    <Icon className="h-5 w-5 min-w-[20px]" />
                    <span className={`ml-3 ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'} transition-opacity duration-300`}>{item.label}</span>
                    {isActive && (
                      <div 
                        className={`ml-auto h-2 w-2 rounded-full ${isExpanded ? 'block' : 'hidden'}`}
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Support & Settings */}
        <div>
          <h2 
            className={`text-lg font-semibold mb-3 ${isExpanded ? 'block' : 'hidden'}`}
            style={{ color: theme.text }}
          >
            Support & Settings
          </h2>
          <ul className="space-y-1">
            {supportItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="flex items-center p-3 rounded-md transition-all duration-300 relative group"
                    style={{ 
                      backgroundColor: isActive ? (theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA') : 'transparent',
                      color: isActive ? theme.primary : theme.text
                    }}
                  >
                    <Icon className="h-5 w-5 min-w-[20px]" />
                    <span className={`ml-3 ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'} transition-opacity duration-300`}>{item.label}</span>
                    {isActive && (
                      <div 
                        className={`ml-auto h-2 w-2 rounded-full ${isExpanded ? 'block' : 'hidden'}`}
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Theme Toggle Button - Fixed at bottom */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="p-2 rounded-full transition-colors duration-300 hover:bg-opacity-80 z-50 cursor-pointer"
            style={{ 
              backgroundColor: theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA',
              color: theme.text
            }}
          >
            {theme.mode === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;