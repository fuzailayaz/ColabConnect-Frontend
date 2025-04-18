'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    UserIcon,
    DocumentTextIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Activity {
    id: string;
    user_id: string;
    action: string;
    entity_type: 'project' | 'task' | 'comment' | 'team';
    entity_id: string;
    created_at: string;
    user_name: string;
    entity_name: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
      if (!user?.id) return;

      const fetchActivities = async () => {
        try {
          // In a real implementation, you would fetch from your activities table
          // For now, we'll use mock data
        
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        
          // Mock activity data
          const mockActivities: Activity[] = [
            {
              id: '1',
              user_id: 'user1',
              action: 'created',
              entity_type: 'project',
              entity_id: 'proj1',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              user_name: 'Alex Johnson',
              entity_name: 'AI Research Platform'
            },
            {
              id: '2',
              user_id: 'user2',
              action: 'completed',
              entity_type: 'task',
              entity_id: 'task1',
              created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
              user_name: 'Sarah Miller',
              entity_name: 'Frontend UI Implementation'
            },
            {
              id: '3',
              user_id: 'user3',
              action: 'commented on',
              entity_type: 'comment',
              entity_id: 'comment1',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
              user_name: 'Michael Chen',
              entity_name: 'Database Schema Design'
            },
            {
              id: '4',
              user_id: 'user4',
              action: 'joined',
              entity_type: 'team',
              entity_id: 'team1',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
              user_name: 'Emily Rodriguez',
              entity_name: 'Mobile Development Team'
            },
            {
              id: '5',
              user_id: 'user5',
              action: 'updated',
              entity_type: 'project',
              entity_id: 'proj2',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
              user_name: 'David Kim',
              entity_name: 'Machine Learning Model'
            }
          ];
        
          setActivities(mockActivities);
        } catch (error) {
          console.error('Error fetching activities:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchActivities();

      // Set up real-time subscription for new activities
      const channel = supabase.channel('activities_changes');
    
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities'
          },
          (payload) => {
            // In a real implementation, you would handle new activities
            console.log('New activity:', payload);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }, [user?.id]);

    const getActivityIcon = (entityType: Activity['entity_type']) => {
      const icons = {
        project: DocumentTextIcon,
        task: CheckCircleIcon,
        comment: ChatBubbleLeftIcon,
        team: UserIcon
      };
    
      const IconComponent = icons[entityType];
      return <IconComponent className="h-5 w-5" />;
    };

    const getTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    if (loading) {
      return (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex space-x-4"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {getActivityIcon(activity.entity_type)}
                </div>
              </div>
            
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">{activity.user_name}</span>
                  {' '}{activity.action}{' '}
                  <Link 
                    href={`/dashboard/${activity.entity_type}s/${activity.entity_id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {activity.entity_name}
                  </Link>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" suppressHydrationWarning>
                  {getTimeAgo(activity.created_at)}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No recent activity
          </p>
        )}
      </div>
    );
}
