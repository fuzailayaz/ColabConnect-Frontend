// src/components/projects/ProjectTasks.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  PlusIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
}

export default function ProjectTasks({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            due_date,
            assignee:profiles(id, full_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match Task interface - assignee comes as array but we need object
        const formattedTasks = (data || []).map(task => ({
          ...task,
          assignee: task.assignee && task.assignee.length > 0 ? task.assignee[0] : null
        }));
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching project tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title,
          description,
          status,
          priority,
          due_date: dueDate || null
        })
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          assignee:profiles(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Transform data to match Task interface
      const formattedTask = {
        ...data,
        assignee: data.assignee && data.assignee.length > 0 ? data.assignee[0] : null
      };
      
      setTasks([formattedTask, ...tasks]);
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
      setIsCreating(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Project Tasks ({tasks.length})
        </h2>
        
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          New Task
        </Button>
      </div>
      
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              rows={3}
              placeholder="Add details about the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      )}
      
      {tasks.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-gray-500">
          No tasks yet. Add your first task!
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleUpdateStatus(
                      task.id, 
                      task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
                    )}
                    className={`mt-1 flex-shrink-0 h-5 w-5 rounded border ${
                      task.status === 'COMPLETED' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 dark:border-gray-600'
                    } flex items-center justify-center`}
                  >
                    {task.status === 'COMPLETED' && <CheckIcon className="h-3 w-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      task.status === 'COMPLETED' 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.due_date && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={task.assignee?.avatar_url} alt={task.assignee?.full_name || 'Unassigned'} />
                            <AvatarFallback>{task.assignee?.full_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.assignee?.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400" 
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}