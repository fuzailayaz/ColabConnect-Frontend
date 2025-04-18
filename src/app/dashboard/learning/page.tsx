'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import {
  Rocket, Search, Code, Server, Database, Cpu, BookOpen, 
  Zap, Activity, Plus, ArrowRight, Users, MessageSquare, 
  FileText, Terminal, GitBranch, GitPullRequest, Clock, 
  Lightbulb, Layers, HardDrive, Wifi, ChevronRight, Star,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

// Dynamic import for the radar chart to avoid SSR issues
const RadarChart = dynamic(() => import('@/components/dashboard/TechStackRadar'), {
  ssr: false,
  loading: () => <div className="h-64 w-full flex items-center justify-center">Loading Tech Stack Radar...</div>,
});

interface CollaborationRequest {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  tech_stack: string[];
  description: string;
  created_at: string;
  type: 'pair_programming' | 'project_swarming';
  duration?: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface EngineeringResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'research_paper' | 'oss_project' | 'lab_opportunity';
  tags: string[];
  category: 'cutting_edge' | 'production_ready' | 'academic';
}

interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'busy';
  last_active: string;
}

export default function EngineeringWorkbench() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [activeDevContext, setActiveDevContext] = useState<'building' | 'researching' | 'debugging' | 'optimizing'>('building');
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [engineeringResources, setEngineeringResources] = useState<EngineeringResource[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<DeviceStatus[]>([]);
  const [notebookEntry, setNotebookEntry] = useState('');
  const [resourceFilter, setResourceFilter] = useState<'cutting_edge' | 'production_ready' | 'academic'>('cutting_edge');
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Supabase
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id);

      if (skillsError) throw skillsError;

      const formattedSkills = skillsData.reduce((acc, skill) => ({
        ...acc,
        [skill.name]: skill.proficiency
      }), {});

      setUserSkills(formattedSkills);

      // Fetch collaboration requests
      const { data: collabData, error: collabError } = await supabase
        .from('collaboration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (collabError) throw collabError;

      setCollaborationRequests(collabData);

      // Fetch other data similarly
      // ...existing code...

    } catch (error) {
      console.error('Error fetching engineering workbench data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = () => {
    router.push('/dashboard/learning/courses');
  };

  const handleNotebookCommand = (command: string) => {
    // In a real implementation, this would process commands like /log-problem
    setNotebookEntry(prev => `${prev}\n\n${command}: `);
  };

  const handleSaveEntry = async () => {
    try {
      const { error } = await supabase
        .from('engineering_notes')
        .insert({
          user_id: user?.id,
          content: notebookEntry,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Entry saved successfully');
      setNotebookEntry('');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleConnectDevice = async () => {
    // Implementation for connecting new device
    toast.info('Device connection feature coming soon');
  };

  const getDevContextIcon = () => {
    switch (activeDevContext) {
      case 'building': return <Rocket className="h-5 w-5" />;
      case 'researching': return <Search className="h-5 w-5" />;
      case 'debugging': return <Terminal className="h-5 w-5" />;
      case 'optimizing': return <Activity className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'research_paper': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'oss_project': return <GitBranch className="h-5 w-5 text-green-500" />;
      case 'lab_opportunity': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default: return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'busy': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" style={{ color: theme.text }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Engineering Workbench
          </h1>
          <p className="text-muted-foreground">
            Your collaborative engineering environment
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            className="flex items-center gap-1 px-3 py-1"
            style={{
              backgroundColor: `${theme.primary}20`,
              color: theme.primary
            }}
          >
            {getDevContextIcon()}
            <span className="capitalize">{activeDevContext}</span>
          </Badge>
          
          <Button 
            onClick={handleCreateSprint} 
            className="flex items-center gap-2"
            style={{
              backgroundColor: theme.primary,
              color: theme.card
            }}
          >
            <Plus className="h-4 w-4" /> Create Sprint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tech Stack Radar */}
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Tech Stack Radar</CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }}>
                Your technical proficiency visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {/* This would be replaced with an actual radar chart component */}
                <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="text-center">
                    <Code className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Tech Stack Radar Visualization</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing proficiency in Languages, Frameworks, Cloud/DevOps, Hardware, and Data Science
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Collaboration Channels */}
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Live Collaboration Channels</CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }}>
                Connect with peers for real-time engineering collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pair_programming">
                <TabsList className="mb-4">
                  <TabsTrigger value="pair_programming">Pair Programming</TabsTrigger>
                  <TabsTrigger value="project_swarming">Project Swarming</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pair_programming" className="space-y-4">
                  {collaborationRequests
                    .filter(req => req.type === 'pair_programming')
                    .map(request => (
                      <motion.div 
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg flex items-start gap-4"
                        style={{ borderColor: theme.border }}
                      >
                        <Avatar>
                          <AvatarImage src={request.avatar_url} />
                          <AvatarFallback>{request.user_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium" style={{ color: theme.text }}>{request.user_name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm mt-1" style={{ color: theme.text }}>{request.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.tech_stack.map(tech => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" className="mt-2" style={{ backgroundColor: theme.primary, color: theme.card }}>
                          Join
                        </Button>
                      </motion.div>
                    ))}
                </TabsContent>
                
                <TabsContent value="project_swarming" className="space-y-4">
                  {collaborationRequests
                    .filter(req => req.type === 'project_swarming')
                    .map(request => (
                      <motion.div 
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg flex items-start gap-4"
                        style={{ borderColor: theme.border }}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium" style={{ color: theme.text }}>{request.user_name}</h4>
                            {request.urgency === 'high' && (
                              <Badge className="bg-red-500 text-white">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1" style={{ color: theme.text }}>{request.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{request.duration}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {request.tech_stack.map(tech => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="mt-2" style={{ backgroundColor: theme.primary, color: theme.card }}>
                          Help Out
                        </Button>
                      </motion.div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" style={{ borderColor: theme.border, color: theme.text }}>
                <Plus className="h-4 w-4 mr-2" /> Create Collaboration Request
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Engineering Notebook */}
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Engineering Notebook</CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }}>
                Today's Log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={notebookEntry} 
                onChange={(e) => setNotebookEntry(e.target.value)}
                placeholder="Use /commands for quick actions..."
                rows={6}
              />
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleNotebookCommand('/log-problem')}
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  /log-problem
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleNotebookCommand('/request-review')}
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  /request-review
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleNotebookCommand('/find-collab')}
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  /find-collab
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSaveEntry}
                style={{ backgroundColor: theme.primary, color: theme.card }}
              >
                Save Entry
              </Button>
            </CardFooter>
          </Card>

          {/* Resource Accelerator */}
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Resource Accelerator</CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }}>
                AI-Curated Engineering Resources
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant={resourceFilter === 'cutting_edge' ? 'primary' : 'outline'}
                  onClick={() => setResourceFilter('cutting_edge')}
                  style={resourceFilter === 'cutting_edge' ? 
                    { backgroundColor: theme.primary, color: theme.card } : 
                    { borderColor: theme.border, color: theme.text }
                  }
                >
                  Cutting Edge
                </Button>
                <Button 
                  size="sm" 
                  variant={resourceFilter === 'production_ready' ? 'primary' : 'outline'}
                  onClick={() => setResourceFilter('production_ready')}
                  style={resourceFilter === 'production_ready' ? 
                    { backgroundColor: theme.primary, color: theme.card } : 
                    { borderColor: theme.border, color: theme.text }
                  }
                >
                  Production Ready
                </Button>
                <Button 
                  size="sm" 
                  variant={resourceFilter === 'academic' ? 'primary' : 'outline'}
                  onClick={() => setResourceFilter('academic')}
                  style={resourceFilter === 'academic' ? 
                    { backgroundColor: theme.primary, color: theme.card } : 
                    { borderColor: theme.border, color: theme.text }
                  }
                >
                  Academic
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {engineeringResources
                .filter(resource => resource.category === resourceFilter)
                .map(resource => (
                  <motion.div 
                    key={resource.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 p-3 border rounded-md"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="mt-1">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: theme.text }}>{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => window.open(resource.url, '_blank')}
                      className="mt-1"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
            </CardContent>
          </Card>

          {/* Hardware Lab (For EE/CE Users) */}
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Hardware Lab</CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }}>
                Connected devices and simulation environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedDevices.map(device => (
                <div 
                  key={device.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-center gap-3">
                    {device.type === 'microcontroller' ? (
                      <Cpu className="h-5 w-5 text-blue-500" />
                    ) : device.type === 'single-board computer' ? (
                      <Server className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Wifi className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-medium" style={{ color: theme.text }}>{device.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{device.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${getDeviceStatusColor(device.status)}`}></div>
                      <span className="text-xs text-muted-foreground capitalize">{device.status}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleConnectDevice}
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <Plus className="h-4 w-4 mr-2" /> Connect New Device
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

