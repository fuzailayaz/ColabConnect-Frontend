// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useEffect, ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, User as UserIcon, LogOut, Menu, Check } from 'lucide-react'; // Added Check
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationList from '../notifications/NotificationList';
import { UserProfileWithAuth } from "@/types/userProfile";
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase-client';
import { Tables } from '@/types/database'; // Import Tables helper
import { toast } from 'react-hot-toast';


// Define types consistent with DashboardLayout/DB schema
// Ensure your regenerated database.ts has the updated 'notifications' type
type NotificationDataType = Tables<'notifications'> & {
    action_url?: string | null; // Make sure this exists in your regenerated type or add manually
    related_project_id?: string | null;
    related_user_id?: string | null;
};

// Props expected from the parent (e.g., DashboardLayout)
interface TopBarProps {
  user: UserProfileWithAuth | null;
  // Expect the parent to pass the fully typed notifications from the DB
  notifications: NotificationDataType[];
  openModal: (component: ComponentType<any>, props?: any) => void;
  onMenuClick: () => void;
  // Add callback to inform parent that notifications were marked read locally
  // So parent can update its state if needed (though realtime should handle it)
  onNotificationsUpdated?: () => void;
}

export default function TopBar({
    onMenuClick,
    user,
    notifications,
    openModal,
    onNotificationsUpdated
}: TopBarProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    const toastId = toast.loading("Marking all as read...");
    try {
      const idsToUpdate = notifications.filter(n => !n.is_read).map(n => n.id);
      if (idsToUpdate.length === 0) {
         toast.dismiss(toastId);
         return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true }) // Cast might not be needed with correct types
        .in('id', idsToUpdate) // Use 'in' for efficiency
        .eq('user_id', user.id); // Ensure user matches

      if (error) throw error;
      toast.success("All notifications marked as read.", { id: toastId });
      setShowNotifications(false); // Close dropdown
      onNotificationsUpdated?.(); // Inform parent (optional)
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast.error(error.message || "Failed to mark all as read.", { id: toastId });
    }
  };

  // This now happens primarily via realtime subscription in the parent layout
  // But we can still trigger the update optimistically if needed.
  const handleMarkOneRead = async (id: string) => {
     // Find the notification to check if it's already read locally
     const notification = notifications.find(n => n.id === id);
     if (!notification || notification.is_read) return; // Already read or not found

     console.log(`Attempting to mark notification ${id} as read...`);
     try {
       // Optimistic UI update can happen in parent via subscription
       // Trigger the actual DB update
       const { error } = await supabase
         .from('notifications')
         .update({ is_read: true })
         .eq('id', id)
         .eq('is_read', false); // Only update if currently false

       if (error) throw error;
       console.log(`Notification ${id} marked as read in DB.`);
       onNotificationsUpdated?.(); // Inform parent (optional)
       // No need to close dropdown here, user might click another
     } catch (error: any) {
        console.error(`Error marking notification ${id} as read:`, error);
        toast.error(error.message || `Failed to mark notification as read.`);
     }
  };

   // --- User Menu Items --- (keep as is)
    const userMenuItems = [
      { label: 'Profile', icon: UserIcon, action: () => router.push('/dashboard/profile') },
      { label: 'Settings', icon: Settings, action: () => router.push('/dashboard/settings') },
      // { label: 'Logout', icon: LogOut, action: handleLogout }, // Add logout logic via AuthContext if needed
    ];

   // --- Close Dropdowns on Outside Click (keep as is) ---
    useEffect(() => {
        // ... (click outside handler remains the same)
         const handleClickOutside = (event: MouseEvent) => {
             if (!(event.target instanceof Element)) return;
             const notificationDropdown = document.querySelector('.notification-dropdown-container');
             const userMenuDropdown = document.querySelector('.user-menu-container');

             if (showNotifications && notificationDropdown && !notificationDropdown.contains(event.target)) {
                 setShowNotifications(false);
             }
             if (showUserMenu && userMenuDropdown && !userMenuDropdown.contains(event.target)) {
                 setShowUserMenu(false);
             }
         };
         document.addEventListener('mousedown', handleClickOutside);
         return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications, showUserMenu]);


  return (
    <div
      className="fixed top-0 right-0 left-0 md:left-16 lg:left-64 h-16 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-all duration-300" // Adjust left padding based on sidebar state if needed
      style={{
        backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF',
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      {/* Left Side - Menu Toggle and potentially Search */}
      <div className="flex items-center space-x-4">
         {/* Menu Toggle Button */}
         <button
           onClick={onMenuClick}
           className="p-2 rounded-md transition-colors md:hidden" // Often hidden on larger screens where sidebar is fixed/overlay
           style={{ color: theme.text }}
           aria-label="Toggle sidebar"
         >
           <Menu className="h-5 w-5" />
         </button>
         {/* Optional: Title or Breadcrumbs here */}
      </div>


       {/* Center - Search Bar (Optional - Can be here or left) */}
        <div className="relative hidden md:block flex-grow max-w-md mx-4">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: theme.textMuted }} />
           <input
             type="text"
             placeholder="Search projects, tasks, users..."
             className="pl-10 pr-4 py-2 rounded-md text-sm w-full transition-colors focus:outline-none"
             style={{
               backgroundColor: theme.mode === 'dark' ? '#2c2c2c' : '#F2F2F7',
               color: theme.text,
               border: `1px solid ${theme.border}`
             }}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>

      {/* Right Side - Notifications and User Menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative notification-dropdown-container">
          {/* ... (Bell Button remains the same) ... */}
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="relative p-2 rounded-full transition-colors"
             style={{
               backgroundColor: showNotifications ? (theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA') : 'transparent',
               color: theme.text
             }}
             onClick={() => setShowNotifications(!showNotifications)}
             aria-label="Notifications"
           >
             <Bell className="h-5 w-5" />
             {unreadCount > 0 && (
               <span
                 className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center rounded-full"
                 style={{ backgroundColor: theme.primary, color: 'white' }}
               >
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
             )}
           </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                 // Adjusted width, max height, scroll
                className="absolute right-0 mt-2 w-80 sm:w-96 py-1 rounded-lg shadow-xl border z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
                style={{
                  backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF',
                  borderColor: theme.border
                }}
              >
                {/* Header inside dropdown */}
                 <div className="px-3 py-2 border-b sticky top-0" style={{ borderColor: theme.border, backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF' }}>
                   <div className="flex justify-between items-center">
                     <h3 className="text-sm font-medium" style={{ color: theme.text }}>Notifications</h3>
                     {unreadCount > 0 && (
                       <button
                         className="text-xs flex items-center gap-1 hover:underline"
                         onClick={handleMarkAllRead}
                         style={{ color: theme.primary }}
                       >
                          <Check className="w-3 h-3"/> Mark all as read
                       </button>
                     )}
                   </div>
                 </div>
                 {/* Pass the notifications directly - NotificationList expects the full type */}
                 <NotificationList
                   notifications={notifications} // Pass the correctly typed array
                   onMarkAsRead={handleMarkOneRead}
                   onItemClick={() => setShowNotifications(false)} // Close dropdown when an item is clicked/navigated
                 />
                 {/* Optional: View All Link at the bottom */}
                  <div className="p-2 border-t sticky bottom-0 text-center" style={{ borderColor: theme.border, backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF' }}>
                      <button onClick={() => { router.push('/dashboard/notifications'); setShowNotifications(false); }} className="text-xs hover:underline" style={{ color: theme.primary }}>
                          View All Notifications
                      </button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu Dropdown */}
        <div className="relative user-menu-container">
           {/* ... (User Button remains the same, ensure src uses user.avatar_url) ... */}
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center space-x-2 p-1 rounded-full transition-colors"
               style={{ backgroundColor: showUserMenu ? (theme.mode === 'dark' ? '#2c2c2c' : '#E5E5EA') : 'transparent' }}
               onClick={() => setShowUserMenu(!showUserMenu)}
             >
               <Image
                 src={user?.avatar_url ?? '/default-avatar.png'}
                 alt="User Avatar"
                 width={32}
                 height={32}
                 className="rounded-full border"
                 style={{ borderColor: theme.border }}
                 onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
               />
               <span className="hidden md:block text-sm font-medium" style={{ color: theme.text }}>
                 {user ? (user.full_name || user.email?.split('@')[0] || 'User') : 'Guest'}
               </span>
             </motion.button>
           <AnimatePresence>
             {showUserMenu && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.15 }}
                 className="absolute right-0 mt-2 w-56 py-1 rounded-lg shadow-xl border z-50" // Increased width slightly
                 style={{ backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF', borderColor: theme.border }}
               >
                  {/* User Info Header */}
                  <div className="px-3 py-2 border-b mb-1" style={{ borderColor: theme.border }}>
                       <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{user?.full_name || 'User'}</p>
                       <p className="text-xs truncate" style={{ color: theme.textMuted }}>{user?.email || 'No email'}</p>
                  </div>
                 <div className="py-1">
                   {userMenuItems.map((item) => (
                     <button
                       key={item.label}
                       className="w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors text-left" // Use theme colors for hover
                       style={{ color: theme.text }}
                       onClick={() => { item.action(); setShowUserMenu(false); }}
                     >
                       <item.icon className="h-4 w-4" style={{ color: theme.textMuted }}/>
                       <span>{item.label}</span>
                     </button>
                   ))}
                    {/* Optional Logout */}
                    {/* <div className="border-t my-1" style={{ borderColor: theme.border }}></div>
                    <button
                       className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
                       onClick={handleLogout} // Implement handleLogout using AuthContext
                     >
                       <LogOut className="h-4 w-4"/>
                       <span>Logout</span>
                     </button> */}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}