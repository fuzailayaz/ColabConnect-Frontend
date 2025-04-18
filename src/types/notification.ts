export interface Notification {
  id: string;
  type: 'message' | 'team' | 'task' | 'system';
  title: string;
  description: string;
  timestamp?: string; // Optional, if you're not using it
  read?: boolean; // Optional, not in DB schema
  user_id: string;
  created_at: string;
  is_read: boolean;
}
