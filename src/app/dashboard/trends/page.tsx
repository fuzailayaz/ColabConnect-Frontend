'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
import { useTheme } from '@/contexts/ThemeContext';
import TrendingSkills from '@/components/dashboard/TrendingSkills';

interface ProjectTrend {
  id: number;
  name: string;
  active_count: number;
}

interface SkillTrend {
  id: number;
  name: string;
  demand_score: number;
  collaborator_count: number;
  growth_percentage: number;
}

interface Activity {
  description: string;
}

export default function TrendsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [projectTrends, setProjectTrends] = useState<ProjectTrend[]>([]);
  const [skillTrends, setSkillTrends] = useState<SkillTrend[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch trends data from Supabase
    const fetchTrends = async () => {
      try {
        // Fetch project trends
        const { data: projectTrendsData, error: projectTrendsError } = await supabase
          .from('project_trends')
          .select('*')
          .order('active_count', { ascending: false })
          .limit(5);

        if (projectTrendsError) {
          throw projectTrendsError;
        }

        // Fetch skill trends
        const { data: skillTrendsData, error: skillTrendsError } = await supabase
          .from('skill_trends')
          .select('*')
          .order('demand_score', { ascending: false })
          .limit(5);

        if (skillTrendsError) {
          throw skillTrendsError;
        }

        // Fetch activity data
        const { data: activityData, error: activityError } = await supabase
          .from('global_activity')
          .select('*')
          .single();

        if (activityError && activityError.code !== 'PGRST116') {
          throw activityError;
        }

        // Update state with real data - use safe type checking
        const safeProjectTrends = Array.isArray(projectTrendsData) 
          ? projectTrendsData.map((item: any) => ({
              id: typeof item?.id === 'number' ? item.id : 0,
              name: typeof item?.name === 'string' ? item.name : '',
              active_count: typeof item?.active_count === 'number' ? item.active_count : 0
            }))
          : [];
        
        const safeSkillTrends = Array.isArray(skillTrendsData)
          ? skillTrendsData.map((item: any) => ({
              id: typeof item?.id === 'number' ? item.id : 0,
              name: typeof item?.name === 'string' ? item.name : '',
              demand_score: typeof item?.demand_score === 'number' ? item.demand_score : 0,
              collaborator_count: typeof item?.collaborator_count === 'number' ? item.collaborator_count : 0,
              growth_percentage: typeof item?.growth_percentage === 'number' ? item.growth_percentage : 0
            }))
          : [];
        
        const safeActivity = activityData && typeof activityData === 'object'
          ? {
              description: typeof (activityData as any)?.description === 'string' 
                ? (activityData as any).description 
                : 'No description available'
            } as Activity
          : null;
        
        setProjectTrends(safeProjectTrends as ProjectTrend[]);
        setSkillTrends(safeSkillTrends as SkillTrend[]);
        setActivity(safeActivity);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setError('Failed to fetch trends data'); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  return (
    <div className="container mx-auto p-6">
      <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ color: theme.text }}>
            <span>Trends Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Trends */}
            <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <CardHeader>
                <CardTitle style={{ color: theme.text }}>Project Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Project trends content */}
                {projectTrends.length > 0 ? (
                  projectTrends.map((trend) => (
                    <div key={trend.id}>{trend.name}</div>
                  ))
                ) : (
                  <div>No project trends available.</div>
                )}
              </CardContent>
            </Card>

            {/* Skill Trends */}
            <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <CardHeader>
                <CardTitle style={{ color: theme.text }}>Skill Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingSkills skills={skillTrends} />
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <CardHeader>
                <CardTitle style={{ color: theme.text }}>Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Activity trends content */}
                {activity ? <div>{activity.description}</div> : <div>No activity data available.</div>}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}