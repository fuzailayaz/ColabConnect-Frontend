// src/components/dashboard/RecommendedCollaborators.tsx
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'; // Fixed import path casing
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client'; // Updated import path
import { toast } from 'react-hot-toast';

interface Collaborator {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skills: string[];
  match_score: number;
  projects?: Project[];
  team_id?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

interface Project {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  required_skills: string[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
}

export default function RecommendedCollaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCollaborators = async () => {
      // Updated initial check
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get user skills first
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('skills')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Updated handling for user without skills
        if (!userData || !userData.skills || userData.skills.length === 0) {
          setCollaborators([]);
          setLoading(false); // Ensure loading stops here too
          return;
        }

        // Updated query to find potential collaborators
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, skills')
          .neq('id', user.id as string) // Exclude the current user
          .not('skills', 'is', null) // Ensure collaborators have skills defined
          .limit(5); // Limit the number of results

        if (error) throw error;

        // Updated formatting, filtering, and sorting
        const formatted = (data || [])
          .filter(c => c.skills && Array.isArray(c.skills) && c.skills.length > 0) // Ensure collaborator has skills array > 0
          .map(c => ({
            ...c,
            // Pass non-null skills array to calculateMatchScore
            match_score: calculateMatchScore(userData.skills, c.skills as string[])
          }))
          .sort((a, b) => b.match_score - a.match_score); // Sort by match score descending

        setCollaborators(formatted);
      } catch (error) { // Use unknown type for safer error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching collaborators:', error);
        // Updated error toast
        toast.error(errorMessage || 'Failed to load collaborators');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [user]); // Dependency array remains the same

  // Function to calculate match score (kept from original)
  const calculateMatchScore = (userSkills: string[], collaboratorSkills: string[]) => {
    // Handle potential null/undefined skills just in case, though filter should prevent it
    if (!userSkills || userSkills.length === 0 || !collaboratorSkills) {
        return 0;
    }
    const commonSkills = userSkills.filter(skill =>
      collaboratorSkills.includes(skill)
    );
    // Prevent division by zero if userSkills somehow becomes empty after initial check
    const score = userSkills.length > 0
      ? (commonSkills.length / userSkills.length) * 100
      : 0;
    return Math.min(100, Math.floor(score)); // Ensure score is between 0 and 100
  };

  // Loading state display (kept from original)
  if (loading) {
    return <div>Loading recommended collaborators...</div>;
  }

  // Render component UI (kept from original)
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Recommended Collaborators</h3>
      {collaborators.length > 0 ? (
        collaborators.map(collaborator => (
          <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={collaborator.avatar_url || ''} alt={collaborator.full_name} />
                <AvatarFallback>
                  {collaborator.full_name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{collaborator.full_name || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">
                  {/* Display top 3 skills or fewer if less than 3 */}
                  {collaborator.skills?.slice(0, 3).join(', ') || 'No skills listed'}
                  {collaborator.skills?.length > 3 ? '...' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-right">
                <div>
                     <span className="text-sm font-semibold text-primary">{collaborator.match_score}%</span>
                     <p className="text-xs text-muted-foreground">Match</p>
                </div>
              <Button size="sm" variant="outline">View Profile</Button> {/* Changed Connect to View Profile for example */}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">
            No recommended collaborators found based on your skills. Consider updating your profile skills.
        </div>
      )}
    </div>
  );
}