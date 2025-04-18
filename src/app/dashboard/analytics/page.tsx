'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon, Users, Clock, Target, PieChart as PieChartIcon, Briefcase, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  team_id?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
  tech_stack?: string[];
  required_skills?: string[];
  visibility?: 'public' | 'private' | 'team_only';
  project_type?: string;
  team_size?: number;
  deadline?: string;
  description?: string;
  owner_id: string;
  domain_id?: string;
  github_url?: string;
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  engagement_score?: number;
  views?: number;
  team_count?: number;
  task_count?: number;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at?: string;
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  completion_percentage?: number;
  comments_count?: number;
  attachments_count?: number;
  watchers?: string[];
  labels?: string[];
}

interface AnalyticsData {
  projectCompletion: { name: string; completion: number }[];
  projectsByType: { name: string; value: number }[];
  projectsByStatus: { name: string; value: number }[];
  totalProjects: number;
  activeTeams: number;
  totalTasks: number;
  completedTasks: number;
  projectSuccess: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    projectCompletion: [],
    projectsByType: [],
    projectsByStatus: [],
    totalProjects: 0,
    activeTeams: 0,
    totalTasks: 0,
    completedTasks: 0,
    projectSuccess: 0
  });

  // Colors for charts
  const COLORS = ['#22C55E', '#4AA8FF', '#F8C555', '#F87171', '#A3A3A3'];

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');
        
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
      // Process data for analytics
      processAnalyticsData(projectsData || [], tasksData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Create sample data if fetch fails
      createSampleData();
    } finally {
      setLoading(false);
    }
  };
  
  const processAnalyticsData = (projects: Project[], tasks: Task[]) => {
    // If no data, create sample data
    if (projects.length === 0) {
      createSampleData();
      return;
    }
    
    // Calculate project completion rates
    const projectCompletion = projects.map(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const completion = projectTasks.length > 0 
        ? (completedTasks / projectTasks.length) * 100 
        : 0;
        
      return {
        name: project.name,
        completion: Math.round(completion)
      };
    });
    
    // Group projects by type
    const typeCount: Record<string, number> = {};
    projects.forEach(project => {
      const type = project.project_type || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    const projectsByType = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    
    // Group projects by status
    const statusCount: Record<string, number> = {};
    projects.forEach(project => {
      const status = project.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    const projectsByStatus = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    
    // Calculate other metrics
    const totalProjects = projects.length;
    const activeTeams = new Set(projects.filter(p => p.team_id).map(p => p.team_id)).size;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const projectSuccess = projects.filter(p => p.status === 'completed').length;
    
    setAnalyticsData({
      projectCompletion,
      projectsByType,
      projectsByStatus,
      totalProjects,
      activeTeams,
      totalTasks,
      completedTasks,
      projectSuccess
    });
  };
  
  const createSampleData = () => {
    // Sample project types
    const projectTypes = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Other'];
    const statuses = ['active', 'planning', 'completed', 'on_hold'] as const;
    
    // Create sample projects
    const sampleProjects = Array.from({ length: 5 }, (_, i) => ({
      id: `sample-${i}`,
      name: `Sample Project ${i + 1}`,
      team_id: `team-${i % 3}`,
      owner_id: `owner-${i % 2}`, // ✅ Add this line
      status: statuses[i % statuses.length],
      created_at: new Date(Date.now() - i * 86400000 * 30).toISOString(),
      updated_at: new Date().toISOString(),
      project_type: projectTypes[i % projectTypes.length]
    }));
    
  
    // Create sample tasks
    const sampleTasks = [];
    for (let i = 0; i < 20; i++) {  
      const projectIndex = i % 5;
      const status = i % 3 === 0 ? 'todo' : (i % 3 === 1 ? 'in_progress' : 'completed');
      sampleTasks.push({
        id: `task-${i}`,
        project_id: `sample-${projectIndex}`,
        title: `Task ${i + 1}`,
        status: status as Task['status'],
        created_at: new Date().toISOString()
      } as Task);
    }
    
    processAnalyticsData(sampleProjects, sampleTasks);
  };

  const MetricCard = ({ title, value, icon: Icon, description, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; 
    description: string;
    color?: string;
  }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color || theme.primary + '20' }}>
          <Icon className="h-4 w-4" style={{ color: color || theme.primary }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your project performance and team metrics</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/projects">View All Projects</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={analyticsData.totalProjects}
          icon={Briefcase}
          description="Total number of projects"
          color="#22C55E"
        />
        <MetricCard
          title="Active Teams"
          value={analyticsData.activeTeams}
          icon={Users}
          description="Teams currently active"
          color="#4AA8FF"
        />
        <MetricCard
          title="Task Completion"
          value={`${analyticsData.totalTasks > 0 ? Math.round((analyticsData.completedTasks / analyticsData.totalTasks) * 100) : 0}%`}
          icon={CheckCircle}
          description={`${analyticsData.completedTasks} of ${analyticsData.totalTasks} tasks completed`}
          color="#F8C555"
        />
        <MetricCard
          title="Project Success Rate"
          value={`${analyticsData.totalProjects > 0 ? Math.round((analyticsData.projectSuccess / analyticsData.totalProjects) * 100) : 0}%`}
          icon={Target}
          description="Successfully completed projects"
          color="#F87171"
        />
      </div>

      <Tabs defaultValue="completion">
        <TabsList>
          <TabsTrigger value="completion">Project Completion</TabsTrigger>
          <TabsTrigger value="types">Project Types</TabsTrigger>
          <TabsTrigger value="status">Project Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Project Completion Rates</CardTitle>
              <CardDescription>Percentage of completed tasks per project</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                {analyticsData.projectCompletion.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.projectCompletion}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.mode === 'dark' ? '#2c2c2c' : '#e5e5ea'} />
                      <XAxis dataKey="name" tick={{ fill: theme.text }} />
                      <YAxis tick={{ fill: theme.text }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#ffffff',
                          borderColor: theme.border
                        }}
                      />
                      <Bar dataKey="completion" fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No project completion data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Projects by Type</CardTitle>
              <CardDescription>Distribution of projects by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                {analyticsData.projectsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.projectsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.projectsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#ffffff',
                          borderColor: theme.border
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No project type data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>Current status of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                {analyticsData.projectsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.projectsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.projectsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#ffffff',
                          borderColor: theme.border
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No project status data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
