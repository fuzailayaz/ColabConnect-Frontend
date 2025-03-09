import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/utils/api';
import {
  CheckCircleIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'task_completed' | 'member_added' | 'comment_added' | 'project_created';
  user: {
    name: string;
    avatar: string;
  };
  target: string;
  timestamp: string;
  project?: {
    id: string;
    name: string;
  };
}

interface PaginatedResponse<T> {
  results: T[];
}

const activityIcons = {
  task_completed: CheckCircleIcon,
  member_added: UserPlusIcon,
  comment_added: ChatBubbleLeftIcon,
  project_created: DocumentPlusIcon,
};

const activityColors = {
  task_completed: 'bg-green-100 text-green-600',
  member_added: 'bg-blue-100 text-blue-600',
  comment_added: 'bg-purple-100 text-purple-600',
  project_created: 'bg-orange-100 text-orange-600',
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Set up real-time updates
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get<PaginatedResponse<Activity>>('/api/activities/');
      setActivities(response.data.results || []); // Handle paginated response
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm dark:bg-gray-800 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Activity Feed
        </h2>
        
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="animate-pulse space-y-4 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    className="flex items-start space-x-4 group"
                  >
                    <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <span className="font-semibold">{activity.user.name}</span>
                          {' '}
                          {activity.type === 'task_completed' && 'completed a task'}
                          {activity.type === 'member_added' && 'joined the team'}
                          {activity.type === 'comment_added' && 'commented on'}
                          {activity.type === 'project_created' && 'created a new project'}
                          {' '}
                          <span className="font-semibold">{activity.target}</span>
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {activity.project && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          in project {activity.project.name}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityFeed;
