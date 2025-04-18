'use client';

import { useState, useEffect } from 'react';
import { Compass, TrendingUp, Users, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  members: number;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar: string;
}

interface Technology {
  name: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

const DiscoveryPanel = () => {
  const { theme } = useTheme();
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [suggestedCollaborators, setSuggestedCollaborators] = useState<Collaborator[]>([]);
  const [trendingTechnologies, setTrendingTechnologies] = useState<Technology[]>([]);
  
  useEffect(() => {
    // In a real app, these would come from API calls
    setRecommendedProjects([
      {
        id: '1',
        title: 'AI-Powered Task Manager',
        description: 'Building a smart task management system with ML prioritization',
        tags: ['React', 'Python', 'Machine Learning'],
        members: 4
      },
      {
        id: '2',
        title: 'Blockchain Voting Platform',
        description: 'Secure and transparent voting system using blockchain',
        tags: ['Solidity', 'Ethereum', 'Web3'],
        members: 3
      },
      {
        id: '3',
        title: 'AR Navigation App',
        description: 'Augmented reality navigation for indoor spaces',
        tags: ['Unity', 'ARKit', 'Mobile'],
        members: 5
      }
    ]);
    
    setSuggestedCollaborators([
      {
        id: '1',
        name: 'Alex Johnson',
        role: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'MongoDB'],
        avatar: '/images/avatars/alex.jpg'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        role: 'UX Designer',
        skills: ['Figma', 'User Research', 'Prototyping'],
        avatar: '/images/avatars/sarah.jpg'
      },
      {
        id: '3',
        name: 'Miguel Rodriguez',
        role: 'Data Scientist',
        skills: ['Python', 'TensorFlow', 'Data Analysis'],
        avatar: '/images/avatars/miguel.jpg'
      }
    ]);
    
    setTrendingTechnologies([
      { name: 'React', trend: 'up', percentage: 12 },
      { name: 'TypeScript', trend: 'up', percentage: 18 },
      { name: 'Web3', trend: 'up', percentage: 24 },
      { name: 'Python', trend: 'stable', percentage: 5 },
      { name: 'Docker', trend: 'up', percentage: 9 }
    ]);
  }, []);

  return (
    <Card style={{ backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Compass className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
          Discover
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="projects" className="flex-1">Recommended Projects</TabsTrigger>
            <TabsTrigger value="collaborators" className="flex-1">Suggested Collaborators</TabsTrigger>
            <TabsTrigger value="technologies" className="flex-1">Trending Technologies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            {recommendedProjects.map(project => (
              <div 
                key={project.id} 
                className="border rounded-lg p-3 cursor-pointer transition-colors hover:bg-opacity-80"
                style={{ 
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.text
                }}
              >
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs rounded-full px-2 py-0.5"
                      style={{ backgroundColor: `${theme.primary}30`, color: theme.primary }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs mt-2" style={{ color: theme.textMuted }}>{project.members} members</div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="collaborators" className="space-y-4">
            {suggestedCollaborators.map(collaborator => (
              <div 
                key={collaborator.id} 
                className="flex items-center border rounded-lg p-3 cursor-pointer transition-colors hover:bg-opacity-80"
                style={{ 
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.text
                }}
              >
                <img 
                  src={collaborator.avatar} 
                  alt={collaborator.name}
                  className="h-10 w-10 rounded-full mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40?text=' + collaborator.name.charAt(0);
                  }}
                />
                <div>
                  <h3 className="font-medium">{collaborator.name}</h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>{collaborator.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {collaborator.skills.slice(0, 2).map(skill => (
                      <span 
                        key={skill} 
                        className="text-xs rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                      >
                        {skill}
                      </span>
                    ))}
                    {collaborator.skills.length > 2 && (
                      <span className="text-xs" style={{ color: theme.textMuted }}>+{collaborator.skills.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="technologies" className="space-y-4">
            {trendingTechnologies.map(tech => (
              <div 
                key={tech.name} 
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-opacity-80 transition-colors"
                style={{ 
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.text
                }}
              >
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2" style={{ color: theme.textMuted }} />
                  <span>{tech.name}</span>
                </div>
                <div className="flex items-center">
                  {tech.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#10b981' }} />
                  )}
                  <span style={{ color: tech.trend === 'up' ? '#10b981' : theme.textMuted }}>
                    {tech.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DiscoveryPanel;
