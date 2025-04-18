// /Users/muhammadfuzailayaz/Downloads/Sem-VIII/Capstone-II/frontend/collabconnect-new/src/components/dashboard/CollaborationHub.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Button } from '@/components/ui/button'; // Fixed import path casing
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added Avatar components
import { Users, MessageSquare, Video, X, Plus, FlaskConical, Cpu, Rocket, Zap, Loader2, Eye } from 'lucide-react'; // Added Eye
import { useTheme } from '@/contexts/ThemeContext'; // Assuming ThemeContext exists
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Database } from '@/types/database'; // Assuming types/database.ts exists
import { cn } from '@/lib/utils'; // Added cn utility

// Define Types based on your Supabase schema (adjust if necessary)
interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skills: string[];
  role?: string;
  status?: 'active' | 'inactive';
}

interface Domain {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  required_skills: string[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  domains?: Domain[];
  team_id?: string;
  visibility: 'public' | 'private' | 'team_only';
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: Profile[];
  projects?: Project[];
  domains?: Domain[];
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

interface CollaborationHubProps {}


// Icons mapping (adjust keys/icons as needed)
const ENGINEERING_ICONS: Record<string, React.ReactNode> = {
    default: <Cpu className="h-5 w-5 text-gray-500" />, // Default icon
    biotechnology: <FlaskConical className="h-5 w-5 text-green-500" />,
    computerscience: <Cpu className="h-5 w-5 text-blue-500" />, // Changed 'computer' to 'computerscience' for example
    mechanicalengineering: <Rocket className="h-5 w-5 text-purple-500" />,
    electricalengineering: <Zap className="h-5 w-5 text-yellow-500" />,
    // Add more domain-icon mappings
};

// Helper to get icon based on domain name
const getDomainIcon = (domainName?: string | null): React.ReactNode => {
    const key = domainName?.toLowerCase().replace(/\s+/g, '') || 'default';
    return ENGINEERING_ICONS[key] || ENGINEERING_ICONS.default;
};


export default function CollaborationHub({}: CollaborationHubProps) { // Removed projects prop
    const router = useRouter();
    const { theme } = useTheme(); // Assuming theme provides { card, border, text, primary }
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    useEffect(() => {
        // Updated fetchTeams function
        const fetchTeams = async () => {
            if (!user || !user.id) {
                setLoading(false); // Stop loading if no user
                return;
            }

            let teamsSubscription: ReturnType<typeof supabase.channel> | null = null;

            try {
                setLoading(true);

                // 1. Fetch team memberships for the current user
                const { data: teamMemberships, error: membershipError } = await supabase
                    .from('team_members')
                    .select('team_id') // Only need the team ID
                    .eq('user_id', user.id as string);

                if (membershipError) {
                    console.error("Error fetching team memberships:", membershipError);
                    throw membershipError;
                }

                // If user is not part of any team
                if (!teamMemberships || teamMemberships.length === 0) {
                    setTeams([]);
                    setLoading(false);
                    return;
                }

                const teamIds = teamMemberships ? teamMemberships.map(t => t.team_id) : [];

                // 2. Fetch details for those teams, including associated domains
                const { data: teamsData, error: teamsError } = await supabase
                    .from('teams')
                    .select(`
                        *,
                        domains (*)
                    `) // Fetch team details and related domains
                    .in('id', teamIds);

                if (teamsError) {
                    console.error("Error fetching teams data:", teamsError);
                    throw teamsError;
                }

                if (!teamsData) {
                    setTeams([]);
                    setLoading(false);
                    return;
                }

                // 3. Fetch members and projects for each team concurrently
                const teamsWithDetails = await Promise.all(
                    teamsData.map(async (team) => {
                        // Fetch members (profiles)
                        const { data: membersData, error: membersError } = await supabase
                            .from('team_members')
                            .select('profiles!inner(*)') // Fetch linked profile data directly
                            .eq('team_id', team.id as string);

                        if (membersError) {
                            console.error(`Error fetching members for team ${team.id}:`, membersError);
                            // Decide if you want to throw or return partial data
                        }

                        // Fetch projects associated with the team, including their domains
                        const { data: projectsData, error: projectsError } = await supabase
                            .from('projects')
                            .select(`
                                *,
                                domains (*)
                             `) // Fetch project details and related domains
                            .eq('team_id', team.id as string); // Filter projects by team_id

                         if (projectsError) {
                            console.error(`Error fetching projects for team ${team.id}:`, projectsError);
                            // Decide if you want to throw or return partial data
                         }

                         return {
                            ...team,
                            members: membersData 
                              ? membersData.map(m => m.profiles as Profile[]) // Assuming m.profiles is an array of Profile objects
                              : [], 
                            projects: projectsData ? (projectsData as Project[]) : [] // Type assertion with null check
                          };
                          
                    })
                );

                setTeams(teamsWithDetails);

                // 4. Set up Real-time Subscription
                // Listen to changes in the user's team memberships
                teamsSubscription = supabase
                    .channel(`user_teams_${user.id}`)
                    .on('postgres_changes', {
                        event: '*', // Listen for INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: 'team_members',
                        filter: `user_id=eq.${user.id}` // Only changes related to this user
                    }, (payload) => {
                        console.log('Team membership change detected:', payload);
                        fetchTeams(); // Re-fetch teams if membership changes
                    })
                    .subscribe((status, err) => {
                        if (err) {
                            console.error("Error subscribing to team changes:", err);
                        }
                         console.log(`Subscription status for user_teams_${user.id}: ${status}`);
                    });

            } catch (error: any) {
                console.error('Failed to load teams:', error);
                toast.error(error.message || 'Failed to load collaboration teams');
                setTeams([]); // Reset on error
            } finally {
                setLoading(false); // Ensure loading is always set to false
            }

             // Cleanup function for useEffect
             return () => {
                if (teamsSubscription) {
                    console.log(`Unsubscribing from channel: user_teams_${user.id}`);
                    supabase.removeChannel(teamsSubscription).catch(err => console.error("Error removing channel:", err));
                }
            };
        };

        fetchTeams();

    }, [user, supabase]); // Added supabase to dependencies as it's used in cleanup


    // --- Event Handlers ---
    const handleExpandToggle = (teamId: string) => {
        setExpandedTeam(current => (current === teamId ? null : teamId));
    };

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        router.push(path);
    };

    const handleExternalLink = (e: React.MouseEvent, url: string) => {
         e.stopPropagation();
         window.open(url, '_blank', 'noopener,noreferrer');
    };

    // --- Sub-Components ---

    // Preview component shown when a team card is expanded
    const TeamPreview = ({ team }: { team: Team }) => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-[-1px] mb-4 overflow-hidden rounded-b-xl border border-t-0 p-4" // Adjust styling
            style={{ borderColor: theme.border, background: `${theme.card}F0` }} // Slightly transparent bg
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Projects Section */}
                <div>
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: theme.text }}>Active Projects</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {(team.projects && team.projects.length > 0) ? team.projects.map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10 cursor-pointer"
                                onClick={(e) => handleNavigation(e, `/dashboard/projects/${project.id}`)} // Navigate to project detail
                            >
                                {getDomainIcon(project.domains?.[0]?.name)}
                                <span className="text-xs font-medium" style={{ color: theme.text }}>{project.name}</span>
                            </div>
                        )) : <p className="text-xs text-muted-foreground">No active projects.</p>}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleNavigation(e, `/dashboard/teams/${team.id}/projects/new`)}
                        className="w-full mt-2 text-xs"
                        style={{ borderColor: theme.border, color: theme.text }}
                    >
                        <Plus className="h-3 w-3 mr-1" /> New Project
                    </Button>
                </div>

                {/* Members Section */}
                <div>
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: theme.text }}>Team Members ({team.members?.length || 0})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {team.members?.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center space-x-2 p-1.5 rounded hover:bg-primary/10 cursor-pointer"
                                onClick={(e) => handleNavigation(e, `/profile/${member.id}`)} // Navigate to member profile
                            >
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || 'Member'} />
                                    <AvatarFallback className="text-xs">
                                        {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-medium" style={{ color: theme.text }}>{member.full_name}</p>
                                    {/* <p className="text-xs opacity-75" style={{ color: theme.text }}>{member.role || 'Member'}</p> */}
                                    {/* Assuming 'role' is not directly on profiles table */}
                                </div>
                            </div>
                        ))}
                    </div>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleNavigation(e, `/dashboard/teams/${team.id}/manage`)} // Navigate to team management
                        className="w-full mt-2 text-xs"
                        style={{ borderColor: theme.border, color: theme.text }}
                    >
                        <Users className="h-3 w-3 mr-1" /> Manage Team
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    // --- Main Render ---

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading Teams...</span>
            </div>
        );
    }

    if (teams.length === 0) {
        return (
             <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <CardHeader>
                    <CardTitle className="flex items-center" style={{ color: theme.text }}>
                        <Users className="mr-2 h-5 w-5 text-primary" /> Collaboration Hub
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You are not part of any teams yet.</p>
                    <Button onClick={() => router.push('/dashboard/teams/create')}> {/* Adjust route as needed */}
                        <Plus className="h-4 w-4 mr-2" /> Create a New Team
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
             <h2 className="text-xl font-semibold" style={{ color: theme.text }}>Your Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                    <motion.div
                        key={team.id}
                        layout // Animate layout changes smoothly
                        transition={{ duration: 0.3 }}
                        className="relative flex flex-col" // Use flex column for structure
                    >
                        <Card
                            className={cn(
                                "cursor-pointer flex-grow flex flex-col transition-all duration-300",
                                expandedTeam === team.id ? "rounded-b-none" : "hover:shadow-lg" // No bottom radius when expanded
                            )}
                            style={{
                                background: theme.card,
                                borderColor: expandedTeam === team.id ? theme.primary : theme.border, // Highlight border when expanded
                                borderWidth: expandedTeam === team.id ? '1px' : '1px'
                             }}
                            onClick={() => handleExpandToggle(team.id)}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                    <span className="font-semibold truncate pr-2" style={{ color: theme.text }}>{team.name}</span>
                                    <span className="text-xs flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
                                        {getDomainIcon(team.domains?.[0]?.name)}
                                        {team.domains?.[0]?.name || 'General'}
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-xs pt-1 truncate" style={{ color: `${theme.text}99` }}>
                                    {team.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between pt-2">
                                {/* Member Avatars */}
                                <div className="flex items-center space-x-[-8px] mb-4">
                                    {team.members?.slice(0, 5).map((member) => (
                                        <Avatar key={member.id} className="h-7 w-7 border-2" style={{ borderColor: theme.card }}>
                                            <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || 'Member'} />
                                            <AvatarFallback className="text-xs">
                                                {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {team.members && team.members.length > 5 && (
                                        <Avatar className="h-7 w-7 border-2 bg-muted" style={{ borderColor: theme.card }}>
                                             <AvatarFallback className="text-xs">+{team.members.length - 5}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7 px-2 flex-1"
                                        style={{ borderColor: theme.border, color: theme.text }}
                                        onClick={(e) => handleNavigation(e, `/dashboard/teams/${team.id}/chat`)}
                                    >
                                        <MessageSquare className="h-3 w-3 mr-1" /> Chat
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7 px-2 flex-1"
                                         style={{ borderColor: theme.border, color: theme.text }}
                                        onClick={(e) => handleExternalLink(e, 'https://meet.google.com/new')} // Example meet link
                                    >
                                        <Video className="h-3 w-3 mr-1" /> Meet
                                    </Button>
                                     <Button
                                        variant="ghost" // Use ghost for less prominent action
                                        size="icon" // Make it icon sized
                                        className="text-xs h-7 w-7"
                                         style={{ color: theme.text }}
                                        onClick={(e) => { e.stopPropagation(); handleExpandToggle(team.id); }}
                                        aria-label={expandedTeam === team.id ? "Collapse details" : "Expand details"}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                         {/* Expanded Preview Area (conditionally rendered outside Card for layout) */}
                        <AnimatePresence>
                            {expandedTeam === team.id && <TeamPreview team={team} />}
                        </AnimatePresence>
                    </motion.div>
                ))}
                 {/* Card for creating a new team */}
                <motion.div whileHover={{ y: -5 }}>
                    <Card
                        className="h-full flex flex-col items-center justify-center border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
                        style={{ background: 'transparent', borderColor: theme.border }}
                        onClick={() => router.push('/dashboard/teams/create')} // Adjust route
                    >
                        <CardContent className="text-center p-6">
                            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="font-medium text-sm" style={{ color: theme.text }}>Create New Team</p>
                            <p className="text-xs text-muted-foreground">Start a new collaboration</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}