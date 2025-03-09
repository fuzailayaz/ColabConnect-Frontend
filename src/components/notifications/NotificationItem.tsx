'use client';

import { motion } from 'framer-motion';
import { Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
    read: boolean;
  };
  onMarkAsRead: (id: string) => void;
}

const iconMap = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = iconMap[notification.type];

  return (
    <motion.div
      className={`p-4 border-b hover:bg-muted/50 transition-colors ${
        notification.read ? 'opacity-50' : ''
      }`}
      whileHover={{ x: 5 }}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${colorMap[notification.type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Mark as read
          </button>
        )}
      </div>
    </motion.div>
  );
}