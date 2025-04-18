// /Users/muhammadfuzailayaz/Downloads/Sem-VIII/Capstone-II/frontend/collabconnect-new/src/components/dashboard/SkillGapAnalysis.tsx
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Award, TrendingUp, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface UserSkillData {
    name: string;
    proficiency_level?: number | null; // From user_skills table (1-5 or null)
}

interface Skill {
    name: string;
    level: number; // User's current proficiency (0-100) - CONVERTED from proficiency_level
    demand: number; // Market demand for the skill (0-100) - MOCKED or fetched
    gap: number; // Calculated difference: demand - level
}

// ... (Keep Course interface) ...
interface Course {
    id: string;
    title: string;
    provider: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    rating: number; // 0-5
    url: string;
    relevant_skill: string;
}

// ... (Keep Theme interface) ...
interface Theme {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    primary: string;
    secondary: string;
    mode: 'light' | 'dark';
}

const SkillGapAnalysis = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchSkillData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const { data: userSkillsRaw, error: userSkillsError } = await supabase
                    .from('user_skills')
                    .select(`
                        proficiency_level,
                        skills ( name )
                    `)
                    .eq('user_id', user.id);

                if (userSkillsError) throw userSkillsError;

                if (!userSkillsRaw || userSkillsRaw.length === 0) {
                    setSkills([]);
                    setRecommendedCourses([]);
                    setLoading(false);
                    return;
                }

                const fetchedUserSkills: UserSkillData[] = userSkillsRaw.map((us: any) => ({
                    name: us.skills?.name,
                    proficiency_level: us.proficiency_level
                })).filter(us => us.name);

                const mockSkills: Skill[] = fetchedUserSkills.map((userSkill): Skill => {
                    let level = 0;
                    if (userSkill.proficiency_level) {
                        level = userSkill.proficiency_level * 20;
                    } else {
                         level = Math.floor(Math.random() * 41) + 10;
                    }

                    const demand = Math.floor(Math.random() * 51) + 50;
                    const gap = Math.max(0, demand - level);

                    return {
                        name: userSkill.name,
                        level: level,
                        demand: demand,
                        gap: gap,
                    };
                }).sort((a, b) => b.gap - a.gap);

                setSkills(mockSkills);

                const mockCourses: Course[] = mockSkills
                    .filter(skill => skill.gap > 20)
                    .slice(0, 3)
                    .map((skill): Course => {
                        const isAdvanced = skill.gap > 40;
                        return {
                            id: `course-${skill.name}-${Math.random().toString(16).slice(2, 8)}`,
                            title: `Mastering ${skill.name}${isAdvanced ? ' - Advanced Techniques' : ''}`,
                            provider: ['Udemy', 'Coursera', 'edX', 'Pluralsight', 'LinkedIn Learning'][Math.floor(Math.random() * 5)],
                            duration: `${Math.floor(Math.random() * 10) + 4}-${Math.floor(Math.random() * 10) + 15} hours`,
                            level: isAdvanced ? 'Advanced' : (skill.gap > 25 ? 'Intermediate' : 'Beginner'),
                            rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                            url: '#',
                            relevant_skill: skill.name,
                        }
                    });

                setRecommendedCourses(mockCourses);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching skill data';
                console.error('Error fetching skill data:', error);
                toast.error(errorMessage);
                setSkills([]);
                setRecommendedCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSkillData();
    }, [user]);

    if (loading) {
        return (
          <div className="flex items-center justify-center h-60 p-6">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground dark:text-gray-400">Loading Skill Analysis...</span>
          </div>
        );
      }

    if (skills.length === 0 && !loading) {
          return (
              <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <CardHeader>
                      <CardTitle className="flex items-center dark:text-gray-100" style={{ color: theme.text }}>
                          <TrendingUp className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
                          Skill Gap Analysis
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                      <p style={{ color: `${theme.text}99` }} className="dark:text-gray-400">
                          No skills found in your profile to analyze.
                      </p>
                      <Button
                          className="mt-4"
                          onClick={() => router.push('/dashboard/profile')}
                          style={{
                              backgroundColor: theme.primary,
                              color: theme.mode === 'dark' ? '#fff' : '#000'
                          }}
                      >
                          Update Your Profile Skills
                      </Button>
                  </CardContent>
              </Card>
          )
      }

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="flex items-center dark:text-gray-100" style={{ color: theme.text }}>
                <TrendingUp className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
                Skill Gap Analysis
              </CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }} className="dark:text-gray-400">
                Comparison of your skills proficiency against estimated market demand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
  {skills.map(skill => (
    <div key={skill.name} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm dark:text-gray-200" style={{ color: theme.text }}>
          {skill.name}
        </span>
        <span className="text-xs dark:text-gray-400" style={{ color: `${theme.text}99` }}>
          Gap:{' '}
          <span className="font-semibold" style={{ color: skill.gap > 30 ? theme.primary : `${theme.text}CC` }}>
            {skill.gap}%
          </span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center space-x-2">
        <div
          className="relative h-2 flex-grow rounded"
          style={{ backgroundColor: `${theme.primary}30` }}
        >
          <div
            className="absolute top-0 left-0 h-full rounded"
            style={{
              width: `${skill.level}%`,
              backgroundColor:
                skill.level >= 70
                  ? "#22c55e" // green-500
                  : skill.level >= 40
                  ? "#facc15" // yellow-500
                  : "#ef4444" // red-500
            }}
          />
        </div>

        <div
          className="text-xs w-10 text-right dark:text-gray-400"
          style={{ color: `${theme.text}99` }}
        >
          {skill.level}%
        </div>
      </div>

      <div className="text-xs dark:text-gray-400" style={{ color: `${theme.text}99` }}>
        Est. Demand: {skill.demand}%
      </div>
    </div>
  ))}
</div>

              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push('/dashboard/skills')}
                style={{
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}10`}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                View Complete Skill Analysis
              </Button>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="flex items-center dark:text-gray-100" style={{ color: theme.text }}>
                <BookOpen className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
                Learning Hub
              </CardTitle>
              <CardDescription style={{ color: `${theme.text}99` }} className="dark:text-gray-400">
                Recommended courses to bridge your top skill gaps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedCourses.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {recommendedCourses.map(course => (
                    <div
                      key={course.id}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                      )}
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.card
                      }}
                      onClick={() => window.open(course.url, '_blank')}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = theme.primary}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = theme.border}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm flex-1 pr-2 dark:text-gray-200" style={{ color: theme.text }}>
                          {course.title}
                        </h3>
                        <div className="flex items-center flex-shrink-0">
                          <Award className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-xs font-medium dark:text-gray-300" style={{ color: theme.text }}>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-1 dark:text-gray-400" style={{ color: `${theme.text}99` }}>
                        <span>{course.provider}</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${theme.primary}20`,
                            color: theme.primary
                          }}
                        >
                          {course.level}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-1 px-2"
                          style={{ color: theme.primary }}
                          onClick={(e) => { e.stopPropagation(); window.open(course.url, '_blank'); }}
                        >
                          View Course <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                  <div className="text-center text-muted-foreground py-6 dark:text-gray-400" style={{ color: `${theme.text}99` }}>
                      No specific course recommendations based on current skill gaps. Keep learning!
                  </div>
              )}
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push('/dashboard/learning')}
                style={{
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}10`}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Browse All Learning Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      );
};

export default SkillGapAnalysis;