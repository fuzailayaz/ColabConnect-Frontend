'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Users,
  FolderKanban,
  Trophy,
  Brain,
  TrendingUp,
  Search,
  ChevronRight,
  MoreVertical,
  Plus,
  Bell,
  Settings,
} from 'lucide-react';

// Dynamic imports for performance
const ProjectAnalytics = dynamic(() => import('@/components/dashboard/ProjectAnalytics'));
const AIRecommendations = dynamic(() => import('@/components/dashboard/AIRecommendations'));
const CollaborationHub = dynamic(() => import('@/components/dashboard/CollaborationHub'));

// Enhanced mock data
const mockData = {
  stats: {
    totalProjects: 15,
    activeCollaborations: 8,
    completedTasks: 45,
    userRanking: 4,
    aiMatchScore: 92,
    pendingRequests: 3
  },
  trendingSkills: [
    { name: 'Machine Learning', count: 24 },
    { name: 'React.js', count: 18 },
    { name: 'Django', count: 15 },
    { name: 'AWS', count: 12 }
  ],
  recentActivities: [
    {
      id: 1,
      type: 'ai_match',
      message: 'New AI-powered project match found!',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'collaboration',
      message: 'Team Alpha started a new ML project',
      timestamp: new Date().toISOString()
    }
  ],
  projectMetrics: {
    completionRate: 78,
    teamEngagement: 92,
    codeQuality: 88
  }
};

interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
  actionButton?: string;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(mockData.stats);
  const [activities, setActivities] = useState(mockData.recentActivities);
  const [metrics, setMetrics] = useState(mockData.projectMetrics);
  const [loading, setLoading] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Add authentication check
  if (!user) {
    return null; // Layout will handle redirect
  }

  // Widget management
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Search Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, collaborators, or skills..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-transparent"
            />
          </div>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* AI Assistant Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <p>Get personalized project recommendations and insights</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="widgets" isDropDisabled={false}>
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {widgets.map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={false}
                  >
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <DashboardWidget widget={widget} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Project Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Project Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-sm font-bold">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'ai_match' ? (
                      <Brain className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Users className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Floating Button */}
      <motion.button
        className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

// Reusable Widget Component
function DashboardWidget({ widget }: { widget: Widget }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{widget.title}</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {widget.content}
        {widget.actionButton && (
          <Button className="w-full mt-4" variant="outline">
            {widget.actionButton}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}