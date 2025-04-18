// src/components/projects/ProjectUpdates.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  PlusIcon,
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

interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string;
  update_type: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function ProjectUpdates({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [updateType, setUpdateType] = useState('progress');

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('project_updates')
          .select(`
            id,
            title,
            content,
            created_at,
            update_type,
            user:profiles(id, full_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match ProjectUpdate interface
        const formattedUpdates = (data || []).map(update => ({
          ...update,
          user: update.user && update.user.length > 0 ? update.user[0] : {
            id: '',
            full_name: '',
            avatar_url: ''
          }
        }));
        
        setUpdates(formattedUpdates);
      } catch (error) {
        console.error('Error fetching project updates:', error);
        toast.error('Failed to load updates');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [projectId]);

  const handleCreateUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to post updates');
      return;
    }

    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title,
          content,
          update_type: updateType
        })
        .select('*')
        .single();

      if (error) throw error;

      // Reset form immediately
      setTitle('');
      setContent('');
      setUpdateType('progress');
      
      // Add the new update to the list
      setUpdates(prev => [{
        ...data,
        user: {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      }, ...prev]);
      
      toast.success('Update posted successfully');
    } catch (error) {
      console.error('Error creating project update:', error);
      toast.error('Failed to post update');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    
    try {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId);
      
      if (error) throw error;
      
      setUpdates(updates.filter(u => u.id !== updateId));
      toast.success('Update deleted successfully');
    } catch (error) {
      console.error('Error deleting project update:', error);
      toast.error('Failed to delete update');
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
          Project Updates ({updates.length})
        </h2>
        
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          New Update
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
              placeholder="What's the update about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Type
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
            >
              <option value="progress">Progress Update</option>
              <option value="milestone">Milestone Reached</option>
              <option value="announcement">Announcement</option>
              <option value="issue">Issue/Block</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              rows={4}
              placeholder="Share details about the update..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUpdate}
              disabled={isCreating}
            >
              {isCreating ? 'Posting...' : 'Post Update'}
            </Button>
          </div>
        </div>
      )}
      
      {updates.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-gray-500">
          No updates yet. Share your first update!
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">

                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={update.user?.avatar_url} alt={update.user?.full_name || ''} />
                    <AvatarFallback>{update.user?.full_name?.charAt(0) || ''}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {update.user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(update.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    update.update_type === 'milestone' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    update.update_type === 'announcement' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    update.update_type === 'issue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {update.update_type}
                  </span>
                  
                  {user?.id === update.user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleDeleteUpdate(update.id)}>
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2 mb-1">
                {update.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {update.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}