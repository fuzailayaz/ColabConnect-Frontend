// /Users/muhammadfuzailayaz/Downloads/Sem-VIII/Capstone-II/frontend/collabconnect-new/src/app/dashboard/tasks/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import TaskCard from '@/components/TaskCard';
import { format } from 'date-fns';
import {
    CheckCircleIcon,
    UserPlusIcon,
    ChatBubbleLeftIcon,
    DocumentPlusIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '@/utils/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Task } from '@/types/dashboard';
import type { Tables } from '@/types/database';

type TaskStatus = Task['status'];

const COLUMNS: TaskStatus[] = ['pending', 'in-progress', 'completed'];

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL');
    const [isUpdating, setIsUpdating] = useState(false);
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [userProjects, setUserProjects] = useState<Tables<'projects'>[]>([]);

    // Real-time subscription setup
    useEffect(() => {
        let mounted = true;

        const subscription = supabase
            .channel('tasks_channel')
            .on('postgres_changes', 
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                },
                (payload) => {
                    if (!mounted) return;
                    handleRealTimeUpdate(payload as RealtimePostgresChangesPayload<Task>);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to tasks channel');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('Failed to subscribe to tasks channel');
                    toast.error('Real-time updates unavailable');
                }
            });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleRealTimeUpdate = (payload: RealtimePostgresChangesPayload<Task>) => {
        if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
                task.id === payload.new?.id ? { ...task, ...payload.new as Task } : task
            ));
        } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
        }
    };

    const fetchUserProjects = async () => {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user?.id) {
                throw new Error('User not authenticated');
            }

            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    team_members!inner (
                        user_id
                    )
                `)
                .eq('team_members.user_id', user.user?.id);

            if (error) throw error;
            setUserProjects(projects || []);
            setError(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
            console.error('Error fetching projects:', errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('tasks')
                .select(`
                    *,
                    assignee:assignee_id (
                        id,
                        email,
                        name, 
                        avatar
                    ),
                    project:project_id (
                        id,
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (projectFilter !== 'all') {
                query = query.eq('project_id', projectFilter);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            if (!data) {
                throw new Error('No data received from database');
            }

            setTasks(data as Task[]);
            setError(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
            console.error('Error fetching tasks:', errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [projectFilter]);

    useEffect(() => {
        fetchUserProjects();
        fetchTasks();
    }, [fetchTasks]);

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus): Promise<boolean> => {
        if (isUpdating) return false;
        
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', taskId);

            if (error) throw error;
            toast.success('Task status updated');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
            console.error('Error updating task status:', errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination || isUpdating) return;

        const { draggableId, destination, source } = result;
        const newStatus = destination.droppableId as TaskStatus;

        if (destination.droppableId === source.droppableId) return;

        const previousTasks = [...tasks];
        const targetTask = tasks.find(task => task.id === draggableId);
        
        if (!targetTask) {
            toast.error('Task not found');
            return;
        }

        // Optimistic update
        setTasks(prev => prev.map(task => 
            task.id === draggableId ? { ...task, status: newStatus } : task
        ));

        const success = await handleStatusChange(draggableId, newStatus);
        if (!success) {
            setTasks(previousTasks);
            toast.error('Failed to update task status');
            return;
        }
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter(task => 
            (filter === 'ALL' || task.status === filter) &&
            task.status === status
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        className="rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="ALL">All Tasks</option>
                        {COLUMNS.map(status => (
                            <option key={status} value={status}>
                                {status.replace('_', ' ')}
                            </option>
                        ))}
                    </select>

                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Projects</option>
                        {userProjects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMNS.map(status => (
                        <Droppable key={status} droppableId={status}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">
                                            {status.replace('-', ' ')}
                                        </h3>
                                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-sm">
                                            {getTasksByStatus(status).length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {getTasksByStatus(status).map((task: Task, index) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onStatusChange={handleStatusChange}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TasksPage;
