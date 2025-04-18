'use client';

import { useState, useEffect } from 'react';
import { Globe, TrendingUp, Users, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import supabase from '@/utils/supabase';

interface TrendData {
  name: string;
  value: number;
  change: number;
}

interface RegionData {
  region: string;
  count: number;
  team_count: number;
}

const GlobalTrends = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trendingSkills, setTrendingSkills] = useState<TrendData[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<TrendData[]>([]);
  const [globalActivity, setGlobalActivity] = useState<RegionData[]>([]);
  const [activeTab, setActiveTab] = useState('skills');
  
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Fetch trending skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skill_trends')
          .select('*')
          .order('value', { ascending: false })
          .limit(5);

        if (skillsError) throw skillsError;

        setTrendingSkills(skillsData.map(skill => ({
          name: skill.name,
          value: skill.collaborator_count,
          change: skill.growth_percentage
        })));

        // Fetch trending project types
        const { data: projectsData, error: projectsError } = await supabase
          .from('project_trends')
          .select('*')
          .order('value', { ascending: false })
          .limit(5);

        if (projectsError) throw projectsError;

        setTrendingProjects(projectsData.map(project => ({
          name: project.type,
          value: project.active_count,
          change: project.growth_percentage
        })));

        // Fetch global activity
        const { data: activityData, error: activityError } = await supabase
          .from('global_activity')
          .select('*')
          .order('count', { ascending: false });

        if (activityError) throw activityError;

        setGlobalActivity(activityData.map(region => ({
          region: region.name,
          count: region.user_count,
          team_count: region.team_count
        })));
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="w-8 h-8 animate-spin" style={{ color: theme.text }} />
      </div>
    );
  }

  const handleSkillClick = (skillName: string) => {
    router.push(`/dashboard/skills?filter=${encodeURIComponent(skillName)}`);
  };

  const handleProjectClick = (projectType: string) => {
    router.push(`/dashboard/projects?type=${encodeURIComponent(projectType)}`);
  };

  const handleRegionClick = (region: string) => {
    router.push(`/dashboard/teams?region=${encodeURIComponent(region)}`);
  };

  return (
    <Card 
      className="transition-shadow duration-200 hover:shadow-lg"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <CardHeader>
        <CardTitle className="flex items-center" style={{ color: theme.text }}>
          <Globe className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
          Global Trends & Activity
        </CardTitle>
        <CardDescription style={{ color: `${theme.text}99` }}>
          Stay updated with what's trending in the collaboration community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="skills" value={activeTab} onValueChange={setActiveTab}>
          <TabsList 
            className="w-full mb-4"
            style={{ backgroundColor: `${theme.primary}10` }}
          >
            <TabsTrigger 
              value="skills" 
              className={cn(
                "flex-1 transition-colors duration-200",
                activeTab === "skills" ? "text-primary" : ""
              )}
              style={{ color: theme.text }}
            >
              Trending Skills
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className={cn(
                "flex-1 transition-colors duration-200",
                activeTab === "projects" ? "text-primary" : ""
              )}
              style={{ color: theme.text }}
            >
              Hot Project Types
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className={cn(
                "flex-1 transition-colors duration-200",
                activeTab === "activity" ? "text-primary" : ""
              )}
              style={{ color: theme.text }}
            >
              Global Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="space-y-4">
            {trendingSkills.map(skill => (
              <div 
                key={skill.name} 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: `${theme.primary}05` }}
                onClick={() => handleSkillClick(skill.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSkillClick(skill.name)}
              >
                <div className="flex items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      "bg-opacity-20"
                    )}
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <span 
                      className="text-xs font-medium"
                      style={{ color: theme.primary }}
                    >
                      {skill.name.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: theme.text }}>
                      {skill.name}
                    </div>
                    <div className="text-xs" style={{ color: `${theme.text}99` }}>
                      {skill.value} collaborators
                    </div>
                  </div>
                </div>
                <div className="flex items-center" style={{ color: theme.primary }}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{skill.change}%</span>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            {trendingProjects.map(project => (
              <div 
                key={project.name} 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: `${theme.primary}05` }}
                onClick={() => handleProjectClick(project.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(project.name)}
              >
                <div className="flex items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      "bg-opacity-20"
                    )}
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <span 
                      className="text-xs font-medium"
                      style={{ color: theme.primary }}
                    >
                      {project.name.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: theme.text }}>
                      {project.name}
                    </div>
                    <div className="text-xs" style={{ color: `${theme.text}99` }}>
                      {project.value} active projects
                    </div>
                  </div>
                </div>
                <div className="flex items-center" style={{ color: theme.primary }}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{project.change}%</span>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            {globalActivity.map(region => (
              <div 
                key={region.region} 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: `${theme.primary}05` }}
                onClick={() => handleRegionClick(region.region)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRegionClick(region.region)}
              >
                <div className="flex items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      "bg-opacity-20"
                    )}
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Globe 
                      className="h-4 w-4"
                      style={{ color: theme.primary }}
                    />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: theme.text }}>
                      {region.region}
                    </div>
                    <div className="text-xs" style={{ color: `${theme.text}99` }}>
                      {region.count} active users
                    </div>
                  </div>
                </div>
                <div className="flex items-center" style={{ color: `${theme.text}99` }}>
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{region.team_count} teams</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlobalTrends;
