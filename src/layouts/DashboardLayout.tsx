'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          user={user as any}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Add your notification component here */}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-20 z-40">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => {/* Add quick action handler */}}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-blue-600 h-1 w-full transform origin-left scale-x-0 transition-transform duration-300">
          {/* Add progress logic here */}
        </div>
      </div>
    </div>
  );
}