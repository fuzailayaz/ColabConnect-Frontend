// src/components/layout/DashboardWrapper.tsx
'use client';

import React, { useState, useEffect, ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { DynamicModal } from '@/components/ui/DynamicModal';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase-client';
import { Tables, Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
  RealtimePostgresDeletePayload,
} from '@supabase/supabase-js';

// Define base types from Supabase schema
type NotificationType = Database['public']['Tables']['notifications']['Row'];
type ProfileType = Database['public']['Tables']['profiles']['Row'];

// Define the combined profile type passed to Header

type UserProfileWithAuth = ProfileType & { email: string | null };

interface DashboardWrapperProps {
  children: React.ReactNode;
}

const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  // --- State ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    component: ComponentType<any>;
    props: any;
  } | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [dbUserProfile, setDbUserProfile] = useState<UserProfileWithAuth | null>(null);

  // --- Hooks ---
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();

  // --- Modal Handlers ---
  const openModal = (component: ComponentType<any>, props = {}) => {
    setModalContent({ component, props });
  };
  const closeModal = () => {
    setModalContent(null);
  };

  // --- Sidebar Toggle Handler ---
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // --- Data Fetching and Realtime Subscriptions ---
  useEffect(() => {
    let notificationChannel: ReturnType<typeof supabase.channel> | null = null;
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupDataAndSubscriptions = async () => {
      if (!authUser?.id) {
        console.log('Auth: No user ID found. Clearing data.');
        setDbUserProfile(null);
        setNotifications([]);
        return;
      }
      
      try {
        // Fetch Initial Profile with error handling
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('DB: Error fetching profile:', profileError);
          toast.error('Failed to load profile data');
          setDbUserProfile(null);
        } else {
          setDbUserProfile({
            ...profileData,
            email: authUser.email
          });
        }

        // Fetch Initial Notifications with error handling
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (notificationsError) {
          console.error('DB: Error fetching notifications:', notificationsError);
          toast.error('Failed to load notifications');
          setNotifications([]);
        } else {
          setNotifications(notificationsData || []);
        }

        // --- Set up Realtime Subscriptions ---
        console.log('Realtime: Setting up channels...');

        // Notifications Channel
        const notificationChannelName = `notifications_user_${authUser.id}`;
        notificationChannel = supabase.channel(notificationChannelName);
        notificationChannel
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${authUser.id}`
          }, (payload: RealtimePostgresInsertPayload<NotificationType>) => {
            console.log('Realtime: Notification INSERT:', payload.new);
            setNotifications(prev => [payload.new, ...prev]);
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${authUser.id}`
          }, (payload: RealtimePostgresUpdatePayload<NotificationType>) => {
            console.log('Realtime: Notification UPDATE:', payload.new);
            if (payload.new?.id) {
              setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
            } else {
              console.warn("Received notification update payload without ID:", payload.new);
            }
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${authUser.id}`
          }, (payload: RealtimePostgresDeletePayload<NotificationType>) => {
            console.log('Realtime: Notification DELETE:', payload.old);
            const deletedId = payload.old.id;
            if (deletedId) {
              setNotifications(prev => prev.filter(n => n.id !== deletedId));
            } else {
              console.warn("Received notification delete payload without ID in 'old':", payload.old);
            }
          })
          .subscribe((status, err) => {
            if (err) console.error(`Realtime: Subscription error (${notificationChannelName}):`, err);
            else console.log(`Realtime: Subscription status (${notificationChannelName}):`, status);
          });

        // Profile Channel
        const profileChannelName = `profile_user_${authUser.id}`;
        profileChannel = supabase.channel(profileChannelName);
        profileChannel
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${authUser.id}`
          }, (payload: RealtimePostgresUpdatePayload<ProfileType>) => {
            console.log('Realtime: Profile UPDATE:', payload.new);
            const newCombinedProfile: UserProfileWithAuth = {
              ...payload.new,
              email: authUser.email ?? null
            };
            setDbUserProfile(newCombinedProfile);
          })
          .subscribe((status, err) => {
            if (err) console.error(`Realtime: Subscription error (${profileChannelName}):`, err);
            else console.log(`Realtime: Subscription status (${profileChannelName}):`, status);
          });

      } catch (error) {
        console.error('Error during setup:', error);
        toast.error('Failed to initialize dashboard data');
        setDbUserProfile(null);
        setNotifications([]);
      }
    };

    setupDataAndSubscriptions();

    // --- Cleanup Function ---
    return () => {
      console.log('Realtime: Cleaning up subscriptions...');
      const cleanup = async () => {
        if (notificationChannel) {
          try {
            await supabase.removeChannel(notificationChannel);
            console.log("Realtime: Notification channel removed.");
          } catch (e) {
            console.error("Realtime: Error removing notification channel:", e);
          }
        }
        if (profileChannel) {
          try {
            await supabase.removeChannel(profileChannel);
            console.log("Realtime: Profile channel removed.");
          } catch (e) {
            console.error("Realtime: Error removing profile channel:", e);
          }
        }
      };
      cleanup();
    };
  }, [authUser]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: theme.background }}>
      <Sidebar
        isOpen={sidebarOpen}
        openModal={openModal}
      />

      <div className={`flex-1 flex flex-col transition-margin duration-300 relative overflow-hidden
                      ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header
          onMenuClick={handleToggleSidebar}
          user={dbUserProfile ? { ...dbUserProfile, email: dbUserProfile.email || '' } : null}
          notifications={notifications}
          openModal={openModal}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ color: theme.text }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      <AnimatePresence>
        {modalContent && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              key="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
            >
              <DynamicModal
                isOpen={!!modalContent}
                component={modalContent.component}
                props={modalContent.props}
                onClose={closeModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardWrapper;