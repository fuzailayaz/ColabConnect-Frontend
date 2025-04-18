'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, BookOpen, Plus, Loader, Trophy, Zap, 
  Code, FileText, CheckCircle, Users, GitPullRequest, 
  Cpu, Database, Server, BarChart, FileCode, Rocket, 
  Brain, Award, Lightbulb, Download, ExternalLink,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

interface EngineeringSprint {
  id: string;
  title: string;
  description: string;
  category: 'software' | 'hardware' | 'hybrid';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills_required: string[];
  company_sponsored: boolean;
  sponsor?: string;
  resources: {
    technical_brief?: string;
    reference_architecture?: string;
    benchmarking_suite?: string;
  };
  validation_gates: string[];
  participants: number;
  completion_rate: number;
}

export default function EngineeringSprints() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'all' | 'software' | 'hardware' | 'hybrid'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sprints, setSprints] = useState<EngineeringSprint[]>([]);
  const [enrolledSprints, setEnrolledSprints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For sprint creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSprint, setNewSprint] = useState({
    title: '',
    description: '',
    category: 'software',
    duration: '2 weeks',
    difficulty: 'intermediate',
    skills_required: '',
    technical_brief: '',
    reference_architecture: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSprints();
    }
  }, [user]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch from the database
      // For now, we'll use mock data
      const mockSprints: EngineeringSprint[] = [
        {
          id: '1',
          title: 'Build a Fault-Tolerant Microservice',
          description: 'Design and implement a resilient microservice with circuit breakers, retries, and graceful degradation',
          category: 'software',
          duration: '2 weeks',
          difficulty: 'intermediate',
          skills_required: ['Node.js', 'Docker', 'API Design', 'Testing'],
          company_sponsored: false,
          resources: {
            technical_brief: 'https://example.com/microservice-brief.pdf',
            reference_architecture: 'https://example.com/microservice-architecture.png',
            benchmarking_suite: 'https://github.com/example/microservice-benchmark'
          },
          validation_gates: [
            'Code Review Passed',
            'Performance Benchmark Met',
            'Stress Test Completed',
            'Peer Validation Received'
          ],
          participants: 128,
          completion_rate: 68
        },
        {
          id: '2',
          title: 'Design PCB with KiCad',
          description: 'Create a complete PCB design for an IoT sensor node using KiCad open-source EDA tools',
          category: 'hardware',
          duration: '3 weeks',
          difficulty: 'advanced',
          skills_required: ['PCB Design', 'KiCad', 'Electronics', 'IoT'],
          company_sponsored: true,
          sponsor: 'Siemens',
          resources: {
            technical_brief: 'https://example.com/pcb-brief.pdf',
            reference_architecture: 'https://example.com/sensor-schematic.png'
          },
          validation_gates: [
            'Schematic Review Passed',
            'DRC Checks Passed',
            'Prototype Fabricated',
            'Functionality Verified'
          ],
          participants: 64,
          completion_rate: 42
        },
        {
          id: '3',
          title: 'Optimize SQL Queries for 10x Throughput',
          description: 'Analyze and optimize a set of complex SQL queries to achieve at least 10x performance improvement',
          category: 'software',
          duration: '1 week',
          difficulty: 'beginner',
          skills_required: ['SQL', 'Database Design', 'Query Optimization'],
          company_sponsored: false,
          resources: {
            technical_brief: 'https://example.com/sql-optimization.pdf',
            benchmarking_suite: 'https://github.com/example/sql-benchmark'
          },
          validation_gates: [
            'Query Plan Analysis',
            'Performance Benchmark Met',
            'Code Review Passed'
          ],
          participants: 256,
          completion_rate: 82
        },
        {
          id: '4',
          title: 'NVIDIA CUDA Optimization Challenge',
          description: 'Optimize a machine learning inference pipeline using CUDA for maximum GPU utilization',
          category: 'software',
          duration: '4 weeks',
          difficulty: 'advanced',
          skills_required: ['CUDA', 'C++', 'Machine Learning', 'GPU Programming'],
          company_sponsored: true,
          sponsor: 'NVIDIA',
          resources: {
            technical_brief: 'https://example.com/cuda-brief.pdf',
            reference_architecture: 'https://example.com/cuda-architecture.png',
            benchmarking_suite: 'https://github.com/example/cuda-benchmark'
          },
          validation_gates: [
            'Code Review Passed',
            '10x Performance Improvement',
            'Memory Optimization Verified',
            'Peer Validation Received'
          ],
          participants: 96,
          completion_rate: 34
        },
        {
          id: '5',
          title: 'Firmware + React Dashboard Integration',
          description: 'Build an embedded firmware solution with a real-time React dashboard for monitoring and control',
          category: 'hybrid',
          duration: '3 weeks',
          difficulty: 'intermediate',
          skills_required: ['C/C++', 'React', 'WebSockets', 'Embedded Systems'],
          company_sponsored: false,
          resources: {
            technical_brief: 'https://example.com/firmware-dashboard.pdf',
            reference_architecture: 'https://example.com/system-architecture.png'
          },
          validation_gates: [
            'Firmware Validation',
            'UI/UX Review',
            'End-to-End Testing',
            'Performance Benchmark Met'
          ],
          participants: 72,
          completion_rate: 58
        }
      ];
      
      setSprints(mockSprints);
      
      // Simulate enrolled sprints
      setEnrolledSprints(['3']);
      
    } catch (error) {
      console.error('Error fetching engineering sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSprint.title.trim()) {
      setError('Sprint title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // In a real implementation, we would save to the database
      // For now, we'll just simulate adding to the list
      const newSprintObj: EngineeringSprint = {
        id: uuidv4(),
        title: newSprint.title,
        description: newSprint.description,
        category: newSprint.category as 'software' | 'hardware' | 'hybrid',
        duration: newSprint.duration,
        difficulty: newSprint.difficulty as 'beginner' | 'intermediate' | 'advanced',
        skills_required: newSprint.skills_required.split(',').map(s => s.trim()),
        company_sponsored: false,
        resources: {
          technical_brief: newSprint.technical_brief,
          reference_architecture: newSprint.reference_architecture
        },
        validation_gates: [
          'Code Review Passed',
          'Performance Benchmark Met',
          'Peer Validation Received'
        ],
        participants: 0,
        completion_rate: 0
      };
      
      setSprints(prev => [newSprintObj, ...prev]);
      setShowCreateForm(false);
      
      // Reset form
      setNewSprint({
        title: '',
        description: '',
        category: 'software',
        duration: '2 weeks',
        difficulty: 'intermediate',
        skills_required: '',
        technical_brief: '',
        reference_architecture: ''
      });
      
    } catch (error: any) {
      console.error('Error creating sprint:', error);
      setError(error.message || 'Failed to create sprint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEnroll = (sprintId: string) => {
    setEnrolledSprints(prev => [...prev, sprintId]);
  };
  
  const filteredSprints = sprints.filter(sprint => {
    const matchesCategory = activeTab === 'all' || sprint.category === activeTab;
    const matchesDifficulty = activeDifficulty === 'all' || sprint.difficulty === activeDifficulty;
    const matchesSearch = sprint.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sprint.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'software': return <Code className="h-5 w-5 text-blue-500" />;
      case 'hardware': return <Cpu className="h-5 w-5 text-purple-500" />;
      case 'hybrid': return <Rocket className="h-5 w-5 text-green-500" />;
      default: return <Code className="h-5 w-5" />;
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };
  
  const getSponsorBadge = (sprint: EngineeringSprint) => {
    if (!sprint.company_sponsored) return null;
    
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        {sprint.sponsor} Challenge
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" style={{ color: theme.text }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/learning')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Engineering Sprints</h1>
            <p className="text-muted-foreground">Project-focused upskilling challenges</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="flex items-center gap-2"
          style={{
            backgroundColor: theme.primary,
            color: theme.card
          }}
        >
          <Plus className="h-4 w-4" /> Create Sprint
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search sprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="software">Software</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs value={activeDifficulty} onValueChange={(value) => setActiveDifficulty(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All Levels</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Sprint Challenge Board */}
      {filteredSprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileCode className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Sprints Found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            No engineering sprints match your current filters. Try adjusting your search or create a new sprint.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create New Sprint
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSprints.map((sprint) => (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="h-full flex flex-col hover:shadow-md transition-shadow duration-200"
                style={{ 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(sprint.category)}
                      <CardTitle style={{ color: theme.text }}>{sprint.title}</CardTitle>
                    </div>
                    {getSponsorBadge(sprint)}
                  </div>
                  <CardDescription style={{ color: `${theme.text}99` }}>
                    {sprint.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {sprint.skills_required.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center" style={{ color: theme.text }}>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{sprint.duration}</span>
                      </div>
                      <Badge className={`${getDifficultyColor(sprint.difficulty)} capitalize`}>
                        {sprint.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span style={{ color: theme.text }}>{sprint.completion_rate}%</span>
                      </div>
                      <Progress value={sprint.completion_rate} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium" style={{ color: theme.text }}>Validation Gates</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {sprint.validation_gates.slice(0, 4).map((gate, index) => (
                          <div key={index} className="flex items-center text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            <span className="text-muted-foreground">{gate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center" style={{ color: theme.text }}>
                        <Users className="h-4 w-4 mr-1" />
                        <span>{sprint.participants} participants</span>
                      </div>
                      <div className="flex gap-2">
                        {sprint.resources.technical_brief && (
                          <Button size="sm" variant="outline" className="h-8 px-2" asChild>
                            <a href={sprint.resources.technical_brief} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        {sprint.resources.reference_architecture && (
                          <Button size="sm" variant="outline" className="h-8 px-2" asChild>
                            <a href={sprint.resources.reference_architecture} target="_blank" rel="noopener noreferrer">
                              <GitPullRequest className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  {enrolledSprints.includes(sprint.id) ? (
                    <Button 
                      className="w-full"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme.card
                      }}
                    >
                      Continue Sprint <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => handleEnroll(sprint.id)}
                      style={{
                        borderColor: theme.border,
                        color: theme.text
                      }}
                    >
                      Start Sprint
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Create Sprint Modal */}
      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create New Engineering Sprint</CardTitle>
            <CardDescription>Design a project-focused upskilling challenge</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateSprint}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Sprint Title *</Label>
                <Input
                  id="title"
                  value={newSprint.title}
                  onChange={(e) => setNewSprint({...newSprint, title: e.target.value})}
                  placeholder="Enter sprint title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSprint.description}
                  onChange={(e) => setNewSprint({...newSprint, description: e.target.value})}
                  placeholder="Describe what engineers will build in this sprint"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newSprint.category}
                    onChange={(e) => setNewSprint({...newSprint, category: e.target.value})}
                    className="border rounded px-3 py-2 w-full transition-colors duration-300 bg-input text-foreground border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <select
                    id="duration"
                    value={newSprint.duration}
                    onChange={(e) => setNewSprint({...newSprint, duration: e.target.value})}
                    className="border rounded px-3 py-2 w-full transition-colors duration-300 bg-input text-foreground border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 weeks">3 weeks</option>
                    <option value="4 weeks">4 weeks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={newSprint.difficulty}
                    onChange={(e) => setNewSprint({...newSprint, difficulty: e.target.value})}
                    className="border rounded px-3 py-2 w-full transition-colors duration-300 bg-input text-foreground border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills_required">Required Skills (comma-separated)</Label>
                  <Input
                    id="skills_required"
                    value={newSprint.skills_required}
                    onChange={(e) => setNewSprint({...newSprint, skills_required: e.target.value})}
                    placeholder="React, TypeScript, API Design"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technical_brief">Technical Brief URL</Label>
                <Input
                  id="technical_brief"
                  value={newSprint.technical_brief}
                  onChange={(e) => setNewSprint({...newSprint, technical_brief: e.target.value})}
                  placeholder="https://example.com/brief.pdf"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference_architecture">Reference Architecture URL</Label>
                <Input
                  id="reference_architecture"
                  value={newSprint.reference_architecture}
                  onChange={(e) => setNewSprint({...newSprint, reference_architecture: e.target.value})}
                  placeholder="https://example.com/architecture.png"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !newSprint.title.trim()}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.card
                }}
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Sprint
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
