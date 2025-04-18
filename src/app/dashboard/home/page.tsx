// src/app/dashboard/home/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Brain, ChevronRight, Plus, Calendar, MessageSquare, Zap, Rocket, 
  FlaskConical, Cpu, Users, Bell, TrendingUp, Award, Lightbulb, Code, 
  Target, FileText, Search, ArrowRight, Activity,
  CheckCircle, Briefcase, Network
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase-client';
import dynamic from 'next/dynamic';
// Define component interfaces for proper TypeScript typing
interface ActivityFeedProps {
  activities?: {
    id: string;
    type: string;
    description: string;
    created_at: string;
    user?: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }[];
}

interface TrendingSkillsProps {
  userSkills: string[];
  onSkillClick?: (skill: string) => void;
}

interface RecommendedCollaboratorsProps {
  collaborators: Collaborator[];
  handleAction: (action: string, payload?: any) => void;
  onConnect?: (collaboratorId: string) => void;
}

interface LookingForCollaboratorsProps {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    skills_required: string[];
    team_size: number;
    deadline?: string;
  }[];
}

interface IntelligentNotificationsProps {
  notifications: {
    id: string;
    type: 'alert' | 'suggestion' | 'success';
    message: string;
    created_at: string;
    action_url?: string;
  }[];
  handleAction: (action: string, payload?: any) => void;
}

interface PersonalInsightsProps {
  userSkills: string[];
  skillLevels?: Record<string, number>;
  recentAchievements?: string[];
}

interface DiscoveryPanelProps {
  recommendations?: {
    id: string;
    type: 'project' | 'skill' | 'team';
    title: string;
    description: string;
    relevance_score: number;
  }[];
}

// Dynamic imports with proper typing
// Load all dashboard components with dynamic imports for better performance
const ActivityFeed = dynamic<ActivityFeedProps>(() => import('@/components/dashboard/ActivityFeed'), {
  loading: () => <div className="p-4 animate-pulse">Loading activity feed...</div>
});

const TrendingSkills = dynamic<TrendingSkillsProps>(() => import('@/components/dashboard/TrendingSkills'), {
  loading: () => <div className="p-4 animate-pulse">Loading trending skills...</div>
});

// Define SkillTrend interface matching the one in TrendingSkills component
interface SkillTrend {
  id: number;
  name: string;
  collaborator_count: number;
  growth_percentage: number;
  demand_score: number;
}

const RecommendedCollaborators = dynamic<RecommendedCollaboratorsProps>(() => import('@/components/dashboard/RecommendedCollaborators'), {
  loading: () => <div className="p-4 animate-pulse">Loading collaborator recommendations...</div>
});

const LookingForCollaborators = dynamic<LookingForCollaboratorsProps>(() => import('@/components/dashboard/LookingForCollaborators'), {
  loading: () => <div className="p-4 animate-pulse">Loading collaboration opportunities...</div>
});

const IntelligentNotifications = dynamic<IntelligentNotificationsProps>(() => import('@/components/dashboard/IntelligentNotifications'), {
  loading: () => <div className="p-4 animate-pulse">Loading notifications...</div>
});

const PersonalInsights = dynamic<PersonalInsightsProps>(() => import('@/components/dashboard/PersonalInsights'), {
  loading: () => <div className="p-4 animate-pulse">Loading personal insights...</div>
});

const DiscoveryPanel = dynamic<DiscoveryPanelProps>(() => import('@/components/dashboard/DiscoveryPanel'), {
  loading: () => <div className="p-4 animate-pulse">Loading discovery panel...</div>
});

const SkillGapAnalysis = dynamic(() => import('@/components/dashboard/SkillGapAnalysis'), {
  loading: () => <div className="p-4 animate-pulse">Loading skill gap analysis...</div>
});

const GlobalTrends = dynamic(() => import('@/components/dashboard/GlobalTrends'), {
  loading: () => <div className="p-4 animate-pulse">Loading global trends...</div>
});

const AIRecommendations = dynamic(() => import('@/components/dashboard/AIRecommendations'), {
  loading: () => <div className="p-4 animate-pulse">Loading AI recommendations...</div>
});

const CollaborationHub = dynamic(() => import('@/components/dashboard/CollaborationHub'), {
  loading: () => <div className="p-4 animate-pulse">Loading collaboration hub...</div>
});

const ProjectAnalytics = dynamic(() => import('@/components/dashboard/ProjectAnalytics'), {
  loading: () => <div className="p-4 animate-pulse">Loading project analytics...</div>
});

const ProjectList = dynamic(() => import('@/components/dashboard/ProjectList'), {
  loading: () => <div className="p-4 animate-pulse">Loading projects...</div>
});

const SmartSearchBar = dynamic(() => import('@/components/dashboard/SmartSearchBar'), {
  loading: () => <div className="p-4 animate-pulse">Loading search...</div>
});

const OnboardingGuide = dynamic(() => import('@/components/dashboard/OnboardingGuide'), {
  loading: () => <div className="p-4 animate-pulse">Loading onboarding guide...</div>
});
// Engineering domain icons with colors
const ENGINEERING_ICONS = {
  biotechnology: <FlaskConical className="h-5 w-5 text-emerald-500" />,
  computer: <Cpu className="h-5 w-5 text-blue-500" />,
  mechanical: <Rocket className="h-5 w-5 text-purple-500" />,
  electrical: <Zap className="h-5 w-5 text-amber-500" />,
  civil: <Target className="h-5 w-5 text-orange-500" />,
  chemical: <Activity className="h-5 w-5 text-pink-500" />,
  aerospace: <Rocket className="h-5 w-5 text-sky-500" />,
  biomedical: <Activity className="h-5 w-5 text-red-500" />,
  environmental: <Lightbulb className="h-5 w-5 text-green-500" />,
  materials: <Code className="h-5 w-5 text-indigo-500" />,
};

// Interface for project data
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
  owner_id: string;
  visibility: 'public' | 'private' | 'team_only';
  tech_stack: string[];
  required_skills: string[];
  team_size: number;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  engineering_domain: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
  deadline?: string | null;
  github_url?: string;
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  project_type?: 'research' | 'academic' | 'personal' | 'startup'; // Updated to match DB schema
  engagement_score?: number;
  views?: number;
  team_count?: number;
  task_count?: number;
  domain_icon?: React.ReactNode;
  domains?: { name: string }[];
  domain_id?: string; // Add missing properties
  team_id?: string;
}

// Interface for AI alert data
interface AIAlert {
  id: string;
  user_id: string;
  message: string;
  type: string;
  priority: number;
  created_at: string;
  action_url?: string;
  is_read: boolean;
}

// Interface for collaborator data
interface Collaborator {
  id: string;
  full_name: string;
  avatar_url?: string;
  skills: string[];
  role: string;
  match_score: number;
  projects_count: number;
}

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [stats, setStats] = useState({
    projectsCount: 0,
    collaboratorsCount: 0,
    tasksCompleted: 0,
    skillsCount: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch all dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchProjects(),
          fetchAiAlerts(),
          fetchCollaborators(),
          fetchStats(),
          fetchNotifications(),
          fetchTrendingProjects(),
          fetchUserProfile()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const projectsChannel = supabase.channel('projects-changes');
    const notificationsChannel = supabase.channel('notifications-changes');
    const alertsChannel = supabase.channel('alerts-changes');

    projectsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => fetchProjects())
      .subscribe();

    notificationsChannel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, () => fetchNotifications())
      .subscribe();

    alertsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ai_alerts'
      }, () => fetchAiAlerts())
      .subscribe();

    return () => {
      projectsChannel.unsubscribe();
      notificationsChannel.unsubscribe();
      alertsChannel.unsubscribe();
    };
  }, [user]);

  // Fetch projects
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data: projectData, error } = await supabase
        .from('projects')
        .select(`
          *,
          team_members:team_members!project_id(
            user_id,
            profiles:user_id(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedProjects = (projectData || []).map(project => ({
        ...project,
        team_count: project.team_members?.length || 0,
        // ... other mappings
      }));
      
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    }
  };

  // Fetch AI-generated alerts
  const fetchAiAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAiAlerts(data || []);
    } catch (error) {
      console.error('Error fetching AI alerts:', error);
      setAiAlerts([]); // Set empty array on error
    }
  };

  // Fetch recommended collaborators
  const fetchCollaborators = async () => {
    if (!user) return;
    
    try {
      // In a real implementation, you would fetch from your collaborators table
      // For now, we'll use mock data
      const mockCollaborators: Collaborator[] = [
        {
          id: '1',
          full_name: 'Alex Johnson',
          avatar_url: 'https://i.pravatar.cc/150?img=1',
          skills: ['React', 'TypeScript', 'Node.js'],
          role: 'Full Stack Developer',
          match_score: 92,
          projects_count: 5
        },
        {
          id: '2',
          full_name: 'Sarah Miller',
          avatar_url: 'https://i.pravatar.cc/150?img=2',
          skills: ['Python', 'Machine Learning', 'Data Science'],
          role: 'ML Engineer',
          match_score: 88,
          projects_count: 3
        },
        {
          id: '3',
          full_name: 'David Kim',
          avatar_url: 'https://i.pravatar.cc/150?img=3',
          skills: ['UI/UX', 'Figma', 'Frontend'],
          role: 'UI/UX Designer',
          match_score: 85,
          projects_count: 7
        }
      ];
      
      setCollaborators(mockCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // In a real implementation, you would fetch from your stats table
      // For now, we'll use mock data
      setStats({
        projectsCount: Math.floor(Math.random() * 10) + 5,
        collaboratorsCount: Math.floor(Math.random() * 20) + 10,
        tasksCompleted: Math.floor(Math.random() * 50) + 20,
        skillsCount: Math.floor(Math.random() * 15) + 5
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set empty array on error
    }
  };

  // Fetch trending projects
  const fetchTrendingProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('visibility', 'public')
        .order('views', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrendingProjects(data || []);
    } catch (error) {
      console.error('Error fetching trending projects:', error);
      setTrendingProjects([]); // Set empty array on error
    }
  };

  // Fetch user profile and skills
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      if (data?.skills) {
        setUserSkills(Array.isArray(data.skills) ? data.skills : []);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // First visit check
  useEffect(() => {
    const hasVisited = localStorage.getItem('dashboardVisited');
    if (!hasVisited) {
      localStorage.setItem('dashboardVisited', 'true');
      setIsFirstVisit(true);
    }
  }, []);

  // Enhanced dynamic action handler with more actions
  const handleAction = useCallback((action: string, payload?: any) => {
    switch (action) {
      case 'open-project':
        setActiveProject(payload.id);
        break;
      case 'create-project':
        router.push('/dashboard/projects/new');
        break;
      case 'open-chat':
        router.push(`/dashboard/messages?project=${payload.id}`);
        break;
      case 'view-profile':
        router.push(`/dashboard/profile/${payload.id}`);
        break;
      case 'view-domain':
        router.push(`/dashboard/domains/${encodeURIComponent(payload.domain)}`);
        break;
      case 'view-collaborators':
        router.push('/dashboard/collaborators');
        break;
      case 'view-notifications':
        router.push('/dashboard/notifications');
        break;
      case 'view-trends':
        router.push('/dashboard/trends');
        break;
      case 'view-skills':
        router.push('/dashboard/skills');
        break;
      case 'toggle-tab':
        setActiveTab(payload.tab);
        break;
      case 'mark-notification-read':
        // In a real app, you would update the notification status in the database
        setNotifications(prev => 
          prev.map(n => n.id === payload.id ? { ...n, read: true } : n)
        );
        break;
      default:
        console.log(`Unknown action: ${action}`);
        break;
    }
  }, [router, setActiveProject, setNotifications, setActiveTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderColor: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20" style={{ color: theme.text }}>
      {/* AI Alerts Banner */}
      {aiAlerts.length > 0 && (
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded-lg shadow-md"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <p className="font-semibold">AI Recommendations</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAiAlerts([])}>Dismiss All</Button>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            {aiAlerts.map(alert => (
              <motion.div 
                key={alert.id} 
                className="p-3 bg-white dark:bg-blue-800/20 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                whileHover={{ y: -2 }}
              >
                <div className="flex justify-between items-start mb-1">
                  <Badge variant={alert.priority > 7 ? "destructive" : "secondary"} className="mb-1">
                    {alert.type}
                  </Badge>
                  <span className="text-xs opacity-70">New</span>
                </div>
                <p className="text-sm">{alert.message}</p>
                {alert.action_url && (
                  <div className="mt-2 text-right">
                    <Link href={alert.action_url} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end">
                      Take action <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Onboarding Guide */}
      <AnimatePresence>
        {isFirstVisit && (
          <OnboardingGuide onDismiss={() => setIsFirstVisit(false)} />
        )}
      </AnimatePresence>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-800/30 p-2 mb-2">
              <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.projectsCount}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Active Projects</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-800/30 p-2 mb-2">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.collaboratorsCount}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Collaborators</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-800/30 p-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.tasksCompleted}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Tasks Completed</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-amber-100 dark:bg-amber-800/30 p-2 mb-2">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.skillsCount}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Skills</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={(tab) => setActiveTab(tab)} className="mt-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Project Quick Actions */}
              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-6 w-6 text-blue-500" />
                    <span>Project Accelerator</span>
                  </CardTitle>
                  <CardDescription>
                    Quick access to your active engineering projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleAction('create-project')}
                      className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-[#121826] dark:to-[#1a2235] hover:from-blue-100 hover:to-blue-50 dark:hover:from-[#1a2235] dark:hover:to-[#1e2640] transition-all duration-300"
                    >
                      <Plus className="h-8 w-8 mb-2 text-blue-500" />
                      <span className="text-sm font-medium">New Project</span>
                    </Button>
                    {projects.slice(0, 3).map(project => (
                      <Button 
                        key={project.id}
                        variant="outline"
                        onClick={() => handleAction('open-project', project)}
                        className="h-24 flex flex-col items-center justify-center relative overflow-hidden group bg-gradient-to-br from-gray-50 to-white dark:from-[#121826] dark:to-[#1a2235] hover:from-gray-100 hover:to-gray-50 dark:hover:from-[#1a2235] dark:hover:to-[#1e2640] transition-all duration-300"
                      >
                        <div className="absolute top-0 right-0 p-1 bg-gradient-to-bl from-blue-100 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-bl-lg">
                          {project.domain_icon}
                        </div>
                        <span className="text-lg font-semibold truncate max-w-[90%] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {project.name}
                        </span>
                        <Badge variant="outline" className="mt-1 text-xs bg-transparent">
                          {project.domains?.[0]?.name || 'General'}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/dashboard/projects')}
                    className="text-xs flex items-center"
                  >
                    View all projects <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Active Project Preview */}
              {activeProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] p-6 rounded-xl shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-800/50"
                >
                  <ProjectPreview 
                    project={projects.find(p => p.id === activeProject) as Project} 
                    onClose={() => setActiveProject(null)}
                    handleAction={handleAction}
                  />
                </motion.div>
              )}

              {/* Activity Feed */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>
                    Latest updates from your projects and collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityFeed />
                </CardContent>
              </Card>

              {/* AI Project Insights */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-green-500" />
                    <span>AI Project Insights</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations for your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-[#132218] dark:to-[#133123] border border-green-100 dark:border-green-900/20">
                      <h4 className="font-medium flex items-center text-green-800 dark:text-green-400 mb-1">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Optimization Opportunity
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Your project "Web Dashboard" could benefit from implementing component lazy loading to improve performance.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#131e2e] dark:to-[#131a36] border border-blue-100 dark:border-blue-900/20">
                      <h4 className="font-medium flex items-center text-blue-800 dark:text-blue-400 mb-1">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Skill Development
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Based on your projects, learning more about GraphQL would enhance your backend integration skills.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/dashboard/ai-insights')}
                    className="text-xs flex items-center"
                  >
                    View all insights <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6">
              {/* Skill Gap Analysis */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span>Skill Gap Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Areas for skill improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillGapAnalysis />
                </CardContent>
              </Card>
              
              {/* Engineering Domains */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5 text-blue-500" />
                    <span>Engineering Domains</span>
                  </CardTitle>
                  <CardDescription>
                    Explore specialized fields for collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(ENGINEERING_ICONS).map(([domain, icon]) => (
                      <Button
                        key={domain}
                        variant="outline"
                        onClick={() => handleAction('view-domain', { domain })}
                        className="flex items-center justify-start h-10 px-3 text-sm capitalize hover:bg-gray-50 dark:hover:bg-[#1e2640] transition-colors duration-200"
                      >
                        {icon}
                        <span className="ml-2 truncate">{domain}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Collaborators */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Recommended Collaborators</span>
                  </CardTitle>
                  <CardDescription>
                    Connect with experts in your field
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <RecommendedCollaborators 
                    collaborators={collaborators} 
                    handleAction={handleAction} 
                  />
                </CardContent>
              </Card>
              
              {/* Collaboration Hub */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-5 w-5 text-orange-500" />
                    <span>Collaboration Hub</span>
                  </CardTitle>
                  <CardDescription>
                    Connect with teams and projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CollaborationHub />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>Project Goals</span>
                </CardTitle>
                <CardDescription>
                  Track your progress towards project milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Frontend Development</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Integration</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Testing</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <ProjectAnalytics />
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Smart Search at the top */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-indigo-500" />
                <span>Discover Projects & Collaborators</span>
              </CardTitle>
              <CardDescription>Find what you're looking for with smart search</CardDescription>
            </CardHeader>
            <CardContent>
              <SmartSearchBar />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Discovery Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-5 w-5 text-purple-500" />
                    <span>Discovery Panel</span>
                  </CardTitle>
                  <CardDescription>Explore new opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <DiscoveryPanel />
                </CardContent>
              </Card>
              
              {/* Looking For Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Projects Seeking Collaborators</span>
                  </CardTitle>
                  <CardDescription>Join exciting engineering projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <LookingForCollaborators />
                </CardContent>
              </Card>
              
              {/* Global Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Global Trends</span>
                  </CardTitle>
                  <CardDescription>What's happening in the engineering community</CardDescription>
                </CardHeader>
                <CardContent>
                  <GlobalTrends />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {/* Trending Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span>Trending Skills</span>
                  </CardTitle>
                  <CardDescription>Skills in high demand</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendingSkills userSkills={userSkills} />
                </CardContent>
              </Card>
              
              {/* Collaboration Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    <span>Collaboration Opportunities</span>
                  </CardTitle>
                  <CardDescription>Connect with other engineers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 3).map(project => (
                      <div key={project.id} className="flex items-start space-x-3 p-3 rounded-md border bg-card">
                        <div className="mt-1 bg-primary/10 p-2 rounded-md">
                          {ENGINEERING_ICONS[project.engineering_domain as keyof typeof ENGINEERING_ICONS] || 
                            <Briefcase className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{project.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {project.description || 'No description available'}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {project.tech_stack?.slice(0, 2).join(', ')}
                              {project.tech_stack && project.tech_stack.length > 2 ? '...' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full text-xs" 
                      onClick={() => router.push('/dashboard/collaborations')}
                    >
                      View All Opportunities
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Project List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span>Your Projects</span>
                  </CardTitle>
                  <CardDescription>Quick access to your projects</CardDescription>
                </CardHeader>
                <CardContent>
                <ProjectList 
                  projects={projects.map(project => ({
                    ...project,
                deadline: project.deadline || null,
                github_url: project.github_url || '',
                project_type: project.project_type || 'personal', // Default to 'personal' to match DB enum
                engagement_score: project.engagement_score || 0,
                views: project.views || 0,
                domains: project.domains || [],
                team_count: project.team_count || 0,
                task_count: project.task_count || 0,
                domain_icon: ENGINEERING_ICONS[project.engineering_domain as keyof typeof ENGINEERING_ICONS] || null,
                domain_id: project.domain_id || '',
                team_id: project.team_id || ''
              }))} 
              />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          {/* AI Assistant Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-indigo-500" />
                <span>AI Assistant Insights</span>
              </CardTitle>
              <CardDescription>
                Personalized recommendations and insights powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your AI assistant analyzes your activity and provides personalized recommendations to help you succeed in your engineering projects.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/ai-assistant')}
                  className="ml-4"
                >
                  Open AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span>AI Recommendations</span>
                  </CardTitle>
                  <CardDescription>Personalized suggestions for your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <AIRecommendations />
                </CardContent>
              </Card>
              
              {/* Personal Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span>Personal Insights</span>
                  </CardTitle>
                  <CardDescription>Understanding your engineering profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalInsights userSkills={userSkills} />
                </CardContent>
              </Card>
              
              {/* Project Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span>Project Analytics</span>
                  </CardTitle>
                  <CardDescription>Performance metrics for your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectAnalytics />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {/* Skill Gap Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span>Skill Gap Analysis</span>
                  </CardTitle>
                  <CardDescription>Areas for skill improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillGapAnalysis />
                </CardContent>
              </Card>
              
              {/* Intelligent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-indigo-500" />
                    <span>AI Alerts</span>
                  </CardTitle>
                  <CardDescription>Important updates from AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <IntelligentNotifications 
                    notifications={notifications.map(n => ({
                      id: n.id || `notification-${Math.random()}`,
                      type: (n.type as 'alert' | 'suggestion' | 'success') || 'alert',
                      message: n.message || '',
                      created_at: n.created_at || new Date().toISOString()
                    }))} 
                    handleAction={handleAction} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleAction('create-project')}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl backdrop-blur-sm"
        style={{ 
          backgroundColor: theme.primary,
          color: theme.text,
          border: `2px solid ${theme.border}`
        }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}// Project Preview Component Interface
interface ProjectPreviewProps {
  project: Project;
  onClose: () => void;
  handleAction: (action: string, payload?: any) => void;
}

// Project Preview Component
const ProjectPreview = ({ project, onClose, handleAction }: ProjectPreviewProps) => {
  if (!project) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Close project preview"
      >
        <Plus className="h-5 w-5 transform rotate-45" />
      </button>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{project.name}</h3>
          <Badge variant={project.status === 'active' ? 'success' : project.status === 'planning' ? 'secondary' : 'outline'}>
            {project.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-300">{project.description}</p>
            
            {/* Project Tasks Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Tasks Progress</span>
                <span className="text-xs font-medium">{project.task_count ? `${Math.floor(Math.random() * 100)}%` : 'No tasks'}</span>
              </div>
              <Progress value={project.task_count ? Math.floor(Math.random() * 100) : 0} className="h-1" />
            </div>
          </div>
          
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Domain:</span>
              <Badge variant="outline" className="text-xs">
                {project.domains?.[0]?.name || 'General'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Team:</span>
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(project.team_count || 1, 3) }).map((_, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                    <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                    <AvatarFallback>U{i+1}</AvatarFallback>
                  </Avatar>
                ))}
                {(project.team_count || 0) > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">+{project.team_count! - 3}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Created:</span>
              <span className="text-xs">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleAction('view-project', { id: project.id })}
            className="flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" /> View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('open-chat', { id: project.id })}
            className="flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-1" /> Team Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('schedule-meeting', { id: project.id })}
            className="flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" /> Schedule Meeting
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
