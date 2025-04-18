"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error: unknown) {
      console.error('Logout failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className="fixed w-full top-0 z-50 transition-colors duration-300"
      style={{ 
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.border}`,
        color: theme.text
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard/home" className="text-xl font-semibold" style={{ color: theme.text }}>
            CollabConnect
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              href="/dashboard/home" 
              className="transition-colors duration-300"
              style={{ 
                color: pathname === "/dashboard/home" ? theme.primary : theme.text,
                fontWeight: pathname === "/dashboard/home" ? "600" : "normal"
              }}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/projects" 
              className="transition-colors duration-300"
              style={{ 
                color: pathname === "/dashboard/projects" ? theme.primary : theme.text,
                fontWeight: pathname === "/dashboard/projects" ? "600" : "normal"
              }}
            >
              Projects
            </Link>
            <Link 
              href="/dashboard/teams" 
              className="transition-colors duration-300"
              style={{ 
                color: pathname === "/dashboard/teams" ? theme.primary : theme.text,
                fontWeight: pathname === "/dashboard/teams" ? "600" : "normal"
              }}
            >
              Teams
            </Link>
            <Link 
              href="/dashboard/messages" 
              className="transition-colors duration-300"
              style={{ 
                color: pathname === "/dashboard/messages" ? theme.primary : theme.text,
                fontWeight: pathname === "/dashboard/messages" ? "600" : "normal"
              }}
            >
              Messages
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: theme.hover }}
            >
              {theme.mode === 'dark' ? (
                <Sun className="h-5 w-5" style={{ color: theme.text }} />
              ) : (
                <Moon className="h-5 w-5" style={{ color: theme.text }} />
              )}
            </button>

            {/* User Menu (simplified) */}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded transition-colors duration-300"
              style={{ 
                backgroundColor: theme.primary,
                color: '#FFFFFF'
              }}
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" style={{ color: theme.text }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: theme.text }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden py-4 space-y-4 transition-all duration-300"
            style={{ backgroundColor: theme.background }}
          >
            <Link 
              href="/dashboard/home" 
              className="block py-2 px-4 transition-colors duration-300"
              style={{ 
                backgroundColor: pathname === "/dashboard/home" ? theme.hover : 'transparent',
                color: pathname === "/dashboard/home" ? theme.primary : theme.text
              }}
              onClick={toggleMobileMenu}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/projects" 
              className="block py-2 px-4 transition-colors duration-300"
              style={{ 
                backgroundColor: pathname === "/dashboard/projects" ? theme.hover : 'transparent',
                color: pathname === "/dashboard/projects" ? theme.primary : theme.text
              }}
              onClick={toggleMobileMenu}
            >
              Projects
            </Link>
            <Link 
              href="/dashboard/teams" 
              className="block py-2 px-4 transition-colors duration-300"
              style={{ 
                backgroundColor: pathname === "/dashboard/teams" ? theme.hover : 'transparent',
                color: pathname === "/dashboard/teams" ? theme.primary : theme.text
              }}
              onClick={toggleMobileMenu}
            >
              Teams
            </Link>
            <Link 
              href="/dashboard/messages" 
              className="block py-2 px-4 transition-colors duration-300"
              style={{ 
                backgroundColor: pathname === "/dashboard/messages" ? theme.hover : 'transparent',
                color: pathname === "/dashboard/messages" ? theme.primary : theme.text
              }}
              onClick={toggleMobileMenu}
            >
              Messages
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
