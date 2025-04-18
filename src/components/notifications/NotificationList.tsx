// src/components/notifications/NotificationList.tsx
'use client';

import { motion } from 'framer-motion';
import { Bell, MessageSquare, Users, CheckCircle, UserPlus, UserCheck, UserX } from 'lucide-react'; // Added join request icons
import { format, isValid, formatDistanceToNow } from 'date-fns'; // Added formatDistanceToNow
import { useTheme } from '@/contexts/ThemeContext';
import { Tables } from '@/types/database';
import Link from 'next/link'; // Import Link for navigation

// Update type to include new fields from DB schema regeneration
// Make sure your `database.ts` includes these fields for notifications table!
type NotificationType = Tables<'notifications'> & {
  action_url?: string | null; // Ensure action_url is expected
  related_project_id?: string | null;
  related_user_id?: string | null;
};

interface NotificationListProps {
  notifications: NotificationType[];
  onMarkAsRead: (id: string) => void;
  onItemClick?: (notification: NotificationType) => void; // Optional handler for click action besides mark as read
}

const getNotificationIcon = (type: NotificationType['type'] | string) => { // Allow string type for flexibility
  const iconColor = '#6B7280'; // Default gray
  switch (type) {
    // Existing types
    case 'message': return <MessageSquare className="w-5 h-5" style={{ color: '#3B82F6' }} />; // Blue
    case 'team': return <Users className="w-5 h-5" style={{ color: '#10B981' }} />; // Green
    case 'task': return <CheckCircle className="w-5 h-5" style={{ color: '#8B5CF6' }} />; // Purple
    case 'system': return <Bell className="w-5 h-5" style={{ color: iconColor }} />; // Gray

    // New join request types
    case 'join_request_received': return <UserPlus className="w-5 h-5" style={{ color: '#F59E0B' }} />; // Amber/Yellow
    case 'join_request_accepted': return <UserCheck className="w-5 h-5" style={{ color: '#10B981' }} />; // Green
    case 'join_request_rejected': return <UserX className="w-5 h-5" style={{ color: '#EF4444' }} />; // Red

    // Default fallback
    default: return <Bell className="w-5 h-5" style={{ color: iconColor }} />;
  }
};

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkAsRead, onItemClick }) => {
  const { theme } = useTheme();

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm" style={{ color: theme.textMuted }}>
        No new notifications
      </div>
    );
  }

  // Safe date formatting function - using relative time
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "Invalid Date";
    } catch (error) {
      console.error("Error formatting date:", timestamp, error);
      return "Error Date";
    }
  };

  const handleItemClick = (notification: NotificationType) => {
      onMarkAsRead(notification.id); // Mark as read on click
      if (onItemClick) {
          onItemClick(notification); // Call additional handler if provided
      }
      // Navigation is handled by the Link component now
  };

  return (
    // Removed max-h here, let parent control scroll if needed from TopBar dropdown
    <div className="divide-y" style={{ borderColor: theme.border }}>
      {notifications.map((notification) => {
          const content = (
              <div
                  className={`flex items-start space-x-3 p-3 transition-colors duration-150 ${
                       notification.is_read ? '' : 'bg-blue-500/5 dark:bg-blue-500/10' // Subtle background for unread
                  } ${notification.action_url ? 'hover:bg-muted/50 dark:hover:bg-gray-700/50' : ''}`} // Hover only if clickable
                  style={{ color: theme.text }}
                  // onClick should not be on the Link itself if we want separate mark as read logic maybe?
                  // For simplicity, clicking the Link marks as read AND navigates
                  onClick={() => handleItemClick(notification)}
                  title={notification.title}
              >
                 {/* Icon */}
                 <div className="flex-shrink-0 mt-1 pt-0.5">
                   {getNotificationIcon(notification.type)}
                 </div>

                 {/* Content */}
                 <div className="flex-1 min-w-0">
                   <p className={`font-medium text-sm truncate ${notification.is_read ? 'font-normal text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-800 dark:text-gray-100'}`}>
                     {notification.title}
                   </p>
                   <p className="text-sm mt-0.5 line-clamp-2" style={{ color: theme.textMuted }}>
                     {notification.description}
                   </p>
                   <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                     {formatTimestamp(notification.created_at)}
                   </p>
                 </div>

                 {/* Unread Indicator (Optional if using background color) */}
                 {/* {!notification.is_read && (
                   <div
                     className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"
                     title="Unread"
                   />
                 )} */}
              </div>
          );

          // Wrap with Link if action_url exists
          return (
              <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
              >
                  {notification.action_url ? (
                      <Link href={notification.action_url} className="block cursor-pointer">
                          {content}
                      </Link>
                  ) : (
                      <div className="block">{content}</div> // Render without Link if no action_url
                  )}
              </motion.div>
          );
      })}
    </div>
  );
};

export default NotificationList;