// New contexts/NotificationContext.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Notification } from '@/types/notification';

const NotificationContext = createContext<{
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  fetchNotifications: () => Promise<void>;
}>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  fetchNotifications: async () => {}
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  };

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase.channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => fetchNotifications())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ notifications, unreadCount, markAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);