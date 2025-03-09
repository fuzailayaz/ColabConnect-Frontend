'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import axios from 'axios';

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

interface TaskCardProps {
  task: Task;
  index: number;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
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
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} scale(1.02)`
              : provided.draggableProps.style?.transform,
          }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className={`mt-4 space-y-4 ${isExpanded ? '' : 'hidden'}`}>
              <p className="text-gray-600 dark:text-gray-300">
                {task.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {task.assignee.name}
                  </span>
                </div>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <select
                value={task.status}
                onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
                className={`w-full mt-2 text-sm rounded-lg px-3 py-2 ${statusColors[task.status]}`}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
