'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';

interface Skill {
  name: string;
  count: number;
  growth: number;
  relatedProjects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  required_skills: string[];
}

interface SkillTrend {
  id: number;
  name: string;
  collaborator_count: number;
  growth_percentage: number;
  demand_score: number;
}

interface TrendingSkillsProps {
  skills?: SkillTrend[];
  userSkills?: string[];
}

const TrendingSkills = ({ skills: propSkills, userSkills }: TrendingSkillsProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(propSkills ? false : true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingSkills = async () => {
    try {
      // Fetch skills from Supabase
      const { data: skillsData, error: skillsError } = await supabase
        .from('skill_trends')
        .select('*')
        .order('demand_score', { ascending: false })
        .limit(10);

      if (skillsError) throw skillsError;
        
      // Fetch related projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(5);

      if (projectsError) throw projectsError;

      // Process and combine data. Provide default values for skills and projects
      const processedSkills = (skillsData || []).map((skill: any) => ({
        name: typeof skill.name === 'string' ? skill.name : '',
        count: typeof skill.collaborator_count === 'number' ? skill.collaborator_count : 0,
        growth: typeof skill.growth_percentage === 'number' ? skill.growth_percentage : 0,
        relatedProjects: (projectsData || [])
          .filter((p: any) => Array.isArray(p.required_skills) && 
            p.required_skills.includes(skill.name))
          .map((p: any) => ({
            id: typeof p.id === 'string' ? p.id : '',
            name: typeof p.name === 'string' ? p.name : '',
            description: p.description || null,
            required_skills: Array.isArray(p.required_skills) ? p.required_skills : []
          }))
      }));

      setSkills(processedSkills);
    } catch (error) {
      console.error('Error fetching trending skills:', error);
      setError('Failed to load trending skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propSkills) {
      // Use the provided skills data
      const processedSkills = propSkills.map(skill => ({
        name: typeof skill.name === 'string' ? skill.name : '',
        count: typeof skill.demand_score === 'number' ? skill.demand_score : 0,
        growth: 0, // Default growth value since it's not provided
        relatedProjects: []
      }));
      setSkills(processedSkills);
    } else {
      // Fetch skills from API if not provided as props
      fetchTrendingSkills();
    }
  }, [propSkills]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-3">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <div
              className="w-1 h-8 rounded-full mr-3"
              style={{
                backgroundColor: `hsl(${210 - index * 15}, 80%, 60%)`
              }}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {skill.name}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300 mr-3">
              {skill.count} projects
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              +{skill.growth}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingSkills;
