'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from '@/components/TaskCard';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate: string;
  tags: string[];
}

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get<{ results: Task[] }>('/api/tasks/');
      setTasks(response.data.results || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get<{ results: Activity[] }>('/api/activities/');
      setActivities(response.data.results || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task['status'];

    try {
      await handleStatusChange(draggableId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <h2 className="text-lg font-semibold mb-4">{status.replace('_', ' ')}</h2>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${activityColors[activity.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span> {activity.target}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}