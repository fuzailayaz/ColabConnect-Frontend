'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { Calendar, Clock, Users, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  project_id: string | null;
  project_name?: string;
  attendees: number;
  type: 'meeting' | 'deadline' | 'milestone' | 'other';
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Format date range for the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Get events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .gte('start_time', startOfMonth.toISOString())
          .lte('end_time', endOfMonth.toISOString());
          
        if (eventsError) throw eventsError;
        
        // Process events data
        let processedEvents: Event[] = eventsData || [];
        
        // If no events found, don't automatically generate sample events
        // This ensures we're only showing real data from the database
        if (processedEvents.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }
        
        // Get project names for events with project_id
        const projectIds = processedEvents
          .filter(event => event.project_id)
          .map(event => event.project_id)
          .filter(Boolean);
          
        if (projectIds.length > 0) {
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, name')
            .in('id', projectIds as any);
            
          if (projectsError) {
            console.error('Error fetching project details:', projectsError);
          }
            
          if (projectsData) {
            const projectMap = new Map(projectsData.map(p => [p.id, p.name]));
            
            processedEvents = processedEvents.map(event => ({
              ...event,
              project_name: event.project_id ? projectMap.get(event.project_id) || 'Unknown Project' : undefined
            }));
          }
        }
        
        // Sort events by start time
        processedEvents.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user?.id, currentDate]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return theme.mode === 'dark' ? '#4AA8FF' : '#3B82F6';
      case 'deadline':
        return theme.mode === 'dark' ? '#F87171' : '#EF4444';
      case 'milestone':
        return theme.mode === 'dark' ? '#22C55E' : '#10B981';
      default:
        return theme.mode === 'dark' ? '#A3A3A3' : '#6B7280';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded-md text-sm ${view === 'day' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-md text-sm ${view === 'week' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded-md text-sm ${view === 'month' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            Month
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Project Timeline</span>
            <div className="text-sm font-normal">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No events scheduled</p>
              <p className="text-muted-foreground">Add events to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: theme.border, borderLeftColor: getEventTypeColor(event.type), borderLeftWidth: '4px' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: getEventTypeColor(event.type) + '20', color: getEventTypeColor(event.type) }}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    
                    {event.project_name && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{event.project_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.attendees} attendee{event.attendees !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}