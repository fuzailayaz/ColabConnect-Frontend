import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/types/database';

export const fetchDashboardData = async (userId: string) => {
  return Promise.all([
    // Projects
    supabase
      .from('projects')
      .select('*, domains!project_domains(*)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // AI Alerts
    supabase
      .from('ai_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);
};