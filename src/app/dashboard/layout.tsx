"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { DynamicModal } from '@/components/ui/DynamicModal';
import { useNavigation } from '@/contexts/NavigationContext';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/types/database';
import useMediaQuery from '@/hooks/useMediaQuery';
import { UserProfileWithAuth } from "@/types/userProfile";


// Define types for notifications and user profile
type NotificationType = Tables<'notifications'>;
type ProfileType = Tables<'profiles'>;
// type UserProfileWithAuth = ProfileType & { email: string | null };

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // State for modal, sidebar, and notifications
  const [modalContent, setModalContent] = useState<{
    component: React.ComponentType<any>;
    props: any;
  } | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hooks
  const { isNavigating } = useNavigation();
  const { user, userProfile } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Fetch notifications and set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        setNotifications((data || []) as unknown as NotificationType[]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to real-time updates
    const notificationChannelName = `notifications_user_${user.id}`;
    const notificationChannel = supabase.channel(notificationChannelName);
    
    notificationChannel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New notification:', payload.new);
        setNotifications(prev => [payload.new as NotificationType, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new?.id) {
          setNotifications((prev) =>
            prev.map(n => n.id === payload.new.id ? payload.new as NotificationType : n)
          );
        }
      })
      .subscribe();
      
    return () => {
      notificationChannel.unsubscribe();
    };
  }, [user?.id]);

  // Modal handlers
  const openModal = (component: React.ComponentType<any>, props = {}) => {
    setModalContent({ component, props });
  };

  const closeModal = () => {
    setModalContent(null);
  };
  
  // Sidebar toggle handler
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

// Create combined user profile object for TopBar that matches TopBar's expected type
const combinedUserProfile: UserProfileWithAuth | null = user && userProfile
? {
    id: userProfile.id,
    full_name: userProfile.full_name ?? '',
    avatar_url: userProfile.avatar_url ?? null,
    skills: userProfile.skills ?? null,
    role: userProfile.role ?? null,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at,
    email: user.email ?? null,
    tasks_completed: userProfile.tasks_completed ?? null,
    projects_completed: userProfile.projects_completed ?? null,
    team_collaborations: userProfile.team_collaborations ?? null,
    bio: userProfile.bio ?? null,
    // Add any other required fields from Supabase
  }
: null;

  // Calculate main content margin based on sidebar state
  const getMainContentClass = () => {
    if (isMobile) return '';
    
    // For desktop: adjust margin based on sidebar state
    if (isTablet) {
      return sidebarOpen ? 'ml-64' : 'ml-16';
    }
    
    return sidebarOpen ? 'ml-64' : 'ml-16';
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F0F] overflow-hidden">
      {/* Sidebar with proper z-index and positioning */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar}
        openModal={openModal} 
      />
      
      {/* Main content area with proper margin for sidebar */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${getMainContentClass()}`}>
        {/* TopBar with proper z-index and user data */}
        <TopBar 
          user={combinedUserProfile}
          notifications={notifications.map(n => ({
            id: n.id,
            user_id: n.user_id,
            title: n.title,
            description: n.message,
            message: n.description,
            type: n.type,
            is_read: n.is_read,
            created_at: n.created_at
          }))} 
          openModal={openModal} 
          onMenuClick={handleToggleSidebar}
        />
        
        {/* Main content with proper padding for TopBar */}
        <main className="flex-1 overflow-y-auto pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={isNavigating ? 'loading' : 'content'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modal with highest z-index */}
      <DynamicModal
        isOpen={!!modalContent}
        onClose={closeModal}
        component={modalContent?.component}
        props={modalContent?.props}
      />
    </div>
  );
}