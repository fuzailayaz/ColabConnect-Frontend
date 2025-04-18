'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/utils/supabase';
import { Loader } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  level: number;
  lastUpdated: string;
}

export default function SkillsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id)
          .order('proficiency_level', { ascending: false });

        if (error) throw error;

        // If skills are found in the database, use them
        if (data && data.length > 0) {
          setSkills(data.map(skill => ({
            id: skill.id,
            name: skill.skill_name,
            level: skill.proficiency_level,
            lastUpdated: skill.updated_at
          })));
        } else {
          // If no skills are found, use mock data
          setSkills([
            {
              id: '1',
              name: 'React',
              level: 85,
              lastUpdated: new Date().toISOString()
            },
            {
              id: '2',
              name: 'TypeScript',
              level: 78,
              lastUpdated: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Next.js',
              level: 72,
              lastUpdated: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Supabase',
              level: 65,
              lastUpdated: new Date().toISOString()
            },
            {
              id: '5',
              name: 'TailwindCSS',
              level: 90,
              lastUpdated: new Date().toISOString()
            },
            {
              id: '6',
              name: 'Node.js',
              level: 70,
              lastUpdated: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Use mock data on error
        setSkills([
          {
            id: '1',
            name: 'React',
            level: 85,
            lastUpdated: new Date().toISOString()
          },
          {
            id: '2',
            name: 'TypeScript',
            level: 78,
            lastUpdated: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Next.js',
            level: 72,
            lastUpdated: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" style={{ color: theme.text }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
        My Skills
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <Card 
            key={skill.id}
            className="hover:shadow-lg transition-shadow duration-200"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>
                {skill.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress 
                  value={skill.level} 
                  max={100}
                  className="h-2"
                  style={{ backgroundColor: `${theme.primary}20` }}
                />
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.text }}>
                    Proficiency: {skill.level}%
                  </span>
                  <span style={{ color: `${theme.text}99` }}>
                    Last updated: {new Date(skill.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
