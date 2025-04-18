// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ProjectList from '@/components/dashboard/ProjectList';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import RecommendedCollaborators from '@/components/dashboard/RecommendedCollaborators';
import TrendingSkills from '@/components/dashboard/TrendingSkills';
import SkillGapAnalysis from '@/components/dashboard/SkillGapAnalysis';
import { supabase } from '@/lib/supabase-client';
import dynamic from 'next/dynamic';
// Removed Button import as it's not used directly here anymore
import {
    Rocket,
    Users as UsersIcon,
    CheckCircle,
    // Clock, // Replaced Clock with Award for Skills card maybe? Or keep Clock.
    Award, // Or keep Clock
    ArrowRight,
    BookOpen,
} from 'lucide-react';

// Dynamic import for the radar chart
const TechStackRadar = dynamic(() => import('@/components/dashboard/TechStackRadar'), {
    ssr: false,
    loading: () => <div className="h-64 w-full flex items-center justify-center text-muted-foreground dark:text-gray-400">Loading Tech Stack Radar...</div>,
});


export default function Dashboard() {
    const [stats, setStats] = useState({
        activeProjects: 0,
        collaborators: 0, // This might need adjustment based on definition (distinct team members across projects?)
        completedTasks: 0,
        skills: 0
    });
    const [loading, setLoading] = useState(true);
    // Store skills as { name: level } where level is 0-100
    const [userSkillsRadar, setUserSkillsRadar] = useState< { [key: string]: number } > ({});
    const { user } = useAuth();
    const { theme } = useTheme(); // theme might not be needed directly here unless styling

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);

                // Fetch ACTIVE projects count
                const { count: activeProjectsCount, error: projectsError } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active') // Filter for active projects
                    // Add filter for user's projects (owner or member) if RLS doesn't cover this view adequately
                    // .or(`owner_id.eq.${user.id},team_members.user_id.eq.${user.id}`); // Example, adjust based on RLS
                    ;

                if (projectsError) throw projectsError;

                // Fetch collaborators count (distinct users user is collaborating with)
                // This is a bit more complex - requires finding projects user is in, then counting *other* unique members in those projects.
                // Simpler approach: Count projects the user is a member of (excluding owned ones if desired)
                const { count: collaborationsCount, error: collaborationsError } = await supabase
                    .from('team_members')
                    .select('project_id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    // Optionally exclude projects they own if 'collaborators' means 'people you work *with*, not projects you *lead*'
                    // .neq('role', 'owner')
                    ;

                if (collaborationsError) throw collaborationsError;


                // Fetch completed tasks count (ASSIGNED to user)
                // Adjust filter if "completed tasks" means tasks in user's projects regardless of assignee
                const { count: completedTasksCount, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'COMPLETED')
                    .eq('assignee_id', user.id); // Filter tasks assigned to the user

                if (tasksError) throw tasksError;

                // Fetch user's skills data (for count and radar)
                const { data: userSkillsData, error: userSkillsError } = await supabase
                    .from('user_skills')
                    .select(`
                        proficiency_level,
                        skills ( name )
                    `)
                    .eq('user_id', user.id);

                if (userSkillsError) throw userSkillsError;

                const skillsCount = userSkillsData?.length || 0;

                // Prepare data for Radar Chart
                const radarSkills: { [key: string]: number } = {};
                if (userSkillsData && userSkillsData.length > 0) {
                    userSkillsData.forEach((us: any) => {
                        if (us.skills?.name) {
                            let level = 0;
                             if (us.proficiency_level) {
                                // Simple linear scale: 1->20, 2->40, 3->60, 4->80, 5->100
                                level = us.proficiency_level * 20;
                            } else {
                                level = 30; // Default level if proficiency is null
                            }
                            radarSkills[us.skills.name] = level;
                        }
                    });

                     // Add default skills if fewer than needed for radar display, avoiding duplicates
                    const defaultSkills = { 'JavaScript': 75, 'React': 80, 'Node.js': 70, 'CSS': 60, 'HTML': 65 };
                    let currentSkillCount = Object.keys(radarSkills).length;
                    for (const [skill, level] of Object.entries(defaultSkills)) {
                        if (currentSkillCount >= 6) break; // Limit total radar skills
                        if (!radarSkills[skill]) {
                            radarSkills[skill] = level;
                            currentSkillCount++;
                        }
                    }

                } else {
                    // Set default skills if user has none
                    setUserSkillsRadar({ 'JavaScript': 75, 'React': 80, 'Node.js': 70, 'CSS': 60, 'HTML': 65, 'Python': 50 });
                }
                 setUserSkillsRadar(radarSkills); // Set the prepared radar skills


                setStats({
                    activeProjects: activeProjectsCount || 0,
                    collaborators: collaborationsCount || 0, // Using collaborations count for now
                    completedTasks: completedTasksCount || 0,
                    skills: skillsCount || 0
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error instanceof Error ? error.message : JSON.stringify(error));
                 // Optionally set default stats or show an error message
                 setStats({ activeProjects: 0, collaborators: 0, completedTasks: 0, skills: 0 });
                 setUserSkillsRadar({}); // Clear radar data on error
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]); // Dependency on user is correct

    const statCards = [
        { title: 'Active Projects', value: stats.activeProjects, icon: Rocket, color: 'bg-blue-500', description: 'Projects you are involved in' },
        { title: 'Collaborations', value: stats.collaborators, icon: UsersIcon, color: 'bg-purple-500', description: 'Projects you contribute to' }, // Renamed for clarity
        { title: 'Tasks Completed', value: stats.completedTasks, icon: CheckCircle, color: 'bg-green-500', description: 'Assigned to you' },
        { title: 'Skills', value: stats.skills, icon: Award, color: 'bg-amber-500', description: 'In your profile' } // Used Award icon
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {user?.user_metadata?.full_name || 'User'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Here's what's happening with your projects and collaborations today.
                </p>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
            >
                <StatisticsCards stats={statCards} loading={loading} />
            </motion.div>

            {/* Main Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Projects Section */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Projects</h2>
                            <button onClick={() => window.location.href = '/dashboard/projects/new'} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                New Project <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        <ProjectList /> {/* Assumes ProjectList fetches its own data based on RLS */}
                    </motion.div>

                    {/* Activity Feed */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                        <ActivityFeed /> {/* Assumes ActivityFeed fetches its own data */}
                    </motion.div>

                    {/* Tech Stack Radar */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                         <div className="flex justify-between items-center mb-6">
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Tech Stack</h2>
                           {/* Link to profile/skills page instead of Learning Hub here */}
                           <button onClick={() => window.location.href = '/dashboard/profile'} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Update Skills <ArrowRight className="h-4 w-4 ml-1" />
                           </button>
                         </div>
                         <div className="h-64 w-full">
                            {!loading && Object.keys(userSkillsRadar).length > 0 ? (
                                <TechStackRadar skills={userSkillsRadar} />
                             ) : !loading ? (
                                <p className="text-center text-muted-foreground dark:text-gray-400 h-full flex items-center justify-center">Add skills to your profile to see your tech stack.</p>
                            ) : null /* Loading handled by dynamic import */}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (Span 1) */}
                <div className="space-y-8">
                    {/* Recommended Collaborators */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recommended Collaborators</h2>
                        <RecommendedCollaborators /> {/* Uses its own fetching logic */}
                    </motion.div>

                    {/* Skill Gap Analysis */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Skill Gap Analysis</h2>
                        <SkillGapAnalysis /> {/* Uses its own fetching logic */}
                    </motion.div>

                    {/* Trending Skills */}
                    <motion.div /* ... animation ... */ className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trending Skills</h2>
                        <TrendingSkills /> {/* Assumes TrendingSkills fetches its own data */}
                    </motion.div>
                </div>
            </div>

            {/* Learning Hub Section (Example - Assumes static content or separate fetching) */}
            <motion.div /* ... animation ... */ className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Hub</h2>
                    </div>
                    <button onClick={() => window.location.href = '/dashboard/learning'} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View All Resources <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                 </div>
                {/* Example static course cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                         <div className="flex items-center mb-2"><Award className="h-5 w-5 text-amber-500 mr-2" /><h3 className="font-semibold text-gray-900 dark:text-white">React Advanced Patterns</h3></div>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Master advanced React patterns...</p>
                         <div className="flex justify-between items-center"><span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">Intermediate</span><span className="text-xs text-gray-500 dark:text-gray-400">8 hours</span></div>
                    </div>≈
                     {/* Card 2 */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                         <div className="flex items-center mb-2"><Award className="h-5 w-5 text-green-500 mr-2" /><h3 className="font-semibold text-gray-900 dark:text-white">Full Stack Development</h3></div>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Build complete web applications...</p>
                         <div className="flex justify-between items-center"><span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Beginner</span><span className="text-xs text-gray-500 dark:text-gray-400">12 hours</span></div>
                    </div>
                     {/* Card 3 */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                         <div className="flex items-center mb-2"><Award className="h-5 w-5 text-purple-500 mr-2" /><h3 className="font-semibold text-gray-900 dark:text-white">AI & Machine Learning</h3></div>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Learn the fundamentals of AI and ML...</p>
                         <div className="flex justify-between items-center"><span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">Advanced</span><span className="text-xs text-gray-500 dark:text-gray-400">15 hours</span></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}