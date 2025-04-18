'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import MultiSelect from '@/components/ui/MultiSelect';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Plus, Loader } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAvailableUsers();
    }
  }, [user]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email');

      if (error) throw error;
      
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to sample data
      setAvailableUsers([
        { id: user?.id || 'current-user', full_name: user?.email?.split('@')[0] || 'Current User' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Create team
      const teamId = uuidv4();
      const { error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            id: teamId,
            name: teamName,
            description,
            created_by: user?.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (teamError) throw teamError;

      // Add team members
      const teamMembers = [
        // Always add current user as team lead
        {
          id: uuidv4(),
          team_id: teamId,
          user_id: user?.id,
          role: 'Team Lead',
          joined_at: new Date().toISOString()
        },
        // Add selected members
        ...selectedMembers.map(memberId => ({
          id: uuidv4(),
          team_id: teamId,
          user_id: memberId,
          role: 'Member',
          joined_at: new Date().toISOString()
        }))
      ];

      // Filter out duplicates (in case current user was also selected)
      const uniqueMembers = teamMembers.filter((member, index, self) =>
        index === self.findIndex((m) => m.user_id === member.user_id)
      );

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(uniqueMembers);

      if (membersError) throw membersError;

      // Navigate back to teams page
      router.push('/dashboard/teams');
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error.message || 'Failed to create team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Team</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>Fill in the information below to create a new team</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the team's purpose and goals"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Team Members</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <MultiSelect
                  options={availableUsers.map(user => ({
                    value: user.id,
                    label: user.full_name
                  }))}
                  selected={selectedMembers}
                  onChange={setSelectedMembers}
                  placeholder="Select team members"
                />
              )}
              <p className="text-sm text-muted-foreground mt-1">
                You will be automatically added as the team lead
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !teamName.trim()}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Team
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}