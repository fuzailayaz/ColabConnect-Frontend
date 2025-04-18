'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Briefcase, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  skills: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  project_count: number;
  created_at: string;
}

export default function TeamsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTeamsAndProjects();
    }
  }, [user]);

  const fetchTeamsAndProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects first to get team associations
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
        
      if (teamsError) throw teamsError;
      
      // Fetch team members for each team
      let processedTeams: Team[] = [];
      
      if (teamsData && teamsData.length > 0) {
        // Process real team data
        for (const team of teamsData) {
          // Get team members
          const { data: membersData } = await supabase
            .from('team_members')
            .select('*, profiles(*)')
            .eq('team_id', team.id);
            
          // Count projects associated with this team
          const teamProjects = projectsData?.filter(p => p.team_id === team.id) || [];
          
          // Format team members
          const members = membersData?.map(member => ({
            id: member.id,
            name: member.profiles?.full_name || 'Team Member',
            role: member.role || 'Member',
            avatar_url: member.profiles?.avatar_url,
            skills: member.skills || []
          })) || [];
          
          processedTeams.push({
            id: team.id,
            name: team.name,
            description: team.description || '',
            members,
            project_count: teamProjects.length,
            created_at: team.created_at
          });
        }
      } else {
        // If no teams exist, create sample teams based on projects
        processedTeams = createSampleTeams(projectsData || []);
      }
      
      setTeams(processedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Fallback to sample data on error
      setTeams(createSampleTeams(projects));
    } finally {
      setLoading(false);
    }
  };
  
  // Create sample teams based on projects
  const createSampleTeams = (projects: any[]): Team[] => {
    // Group projects by type or domain
    const projectTypes = [...new Set(projects.map(p => p.project_type || 'General'))];
    
    return projectTypes.map((type, index) => {
      const typeProjects = projects.filter(p => p.project_type === type);
      
      return {
        id: `sample-${index}`,
        name: `${type} Team`,
        description: `Team responsible for ${type.toLowerCase()} projects`,
        members: [
          {
            id: `member-${index}`,
            name: user?.email?.split('@')[0] || 'Team Lead',
            role: 'Team Lead',
            avatar_url: user?.user_metadata?.avatar_url,
            skills: typeProjects[0]?.required_skills || ['Collaboration']
          }
        ],
        project_count: typeProjects.length,
        created_at: new Date().toISOString()
      };
    });
  };

  const handleCreateTeam = () => {
    // Navigate to team creation page or open modal
    router.push('/dashboard/teams/new');
  };
  
  const handleViewTeam = (teamId: string) => {
    router.push(`/dashboard/teams/${teamId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage your collaboration teams</p>
        </div>
        <Button onClick={handleCreateTeam} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>
      
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Teams Found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first team to start collaborating with others on projects.
          </p>
          <Button onClick={handleCreateTeam}>
            <Plus className="h-4 w-4 mr-2" /> Create Your First Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Team Members</h4>
                      <div className="flex -space-x-2">
                        {team.members.map((member, i) => (
                          <Avatar key={member.id} className="border-2 border-background">
                            <AvatarImage src={member.avatar_url || `/avatars/avatar-${(i % 5) + 1}.png`} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length === 0 && (
                          <div className="text-sm text-muted-foreground">No members yet</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{team.project_count} Project{team.project_count !== 1 ? 's' : ''}</span>
                      </div>
                      <Badge variant={team.project_count > 0 ? 'default' : 'outline'}>
                        {team.project_count > 0 ? 'Active' : 'New'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleViewTeam(team.id)}
                  >
                    View Team <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}