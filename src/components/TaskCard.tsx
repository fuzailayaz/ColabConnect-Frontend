'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import type { Task } from '@/types/dashboard';

interface TaskCardProps {
  task: Task;
  index: number;
  onStatusChange?: (id: string, status: 'pending' | 'in-progress' | 'completed') => Promise<boolean>;
}

const priorityColors: { [key: string]: string } = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};

const statusColors: { [key: string]: string } = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export default function TaskCard({ task, index, onStatusChange }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-4 ${
              snapshot.isDragging ? 'shadow-lg' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isExpanded ? task.description : `${task.description?.slice(0, 100)}...`}
              </p>
              {task.description && task.description.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src={task.assignee?.avatar || ''}
                  alt={task.assignee?.name || ''}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{task.assignee?.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Due {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No due date'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <select
                value={task.status}
                onChange={(e) => onStatusChange?.(task.id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                className={`text-sm rounded-lg px-2 py-1 ${statusColors[task.status]}`}
              >
                <option value="pending">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
