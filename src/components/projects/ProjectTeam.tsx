// src/components/projects/ProjectTeam.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  UserPlusIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';

interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  status: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ProjectTeamProps {
  projectId: string;
  isOwner: boolean; // Required boolean indicating if the current user is the project owner
}

export default function ProjectTeam({ projectId, isOwner }: ProjectTeamProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTechStack, setProjectTechStack] = useState<string[]>([]);
  const [projectRequiredSkills, setProjectRequiredSkills] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState<'planning' | 'active' | 'completed' | 'on_hold'>('planning');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            project_id,
            role,
            status,
            user:profiles(id, full_name, avatar_url)
          `)
          .eq('project_id', projectId);
        
        if (error) throw error;
        
        // Transform data to match TeamMember interface - user comes as array but we need object
        const formattedMembers = (data || []).map(member => ({
          ...member,
          user: member.user && member.user.length > 0 ? member.user[0] : {
            id: '',
            full_name: '',
            avatar_url: ''
          }
        }));
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      setAddingMember(true);
      
      // First, get the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single();
      
      if (userError || !userData) {
        throw userError || new Error('User not found');
      }
      
      // Check if user is already a member
      if (members.some(m => m.user_id === userData.id)) {
        throw new Error('User is already a team member');
      }
      
      // Add to team
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role: 'member',
          status: 'pending'
        });
      
      if (teamError) throw teamError;
      
      // Refresh members list
      const { data: newMemberData, error: newMemberError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          project_id,
          role,
          status,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single();
      
      if (newMemberError) throw newMemberError;
      
      // Transform data to match TeamMember interface
      const formattedMember = {
        ...newMemberData,
        user: newMemberData.user && newMemberData.user.length > 0 ? newMemberData.user[0] : {
          id: '',
          full_name: '',
          avatar_url: ''
        }
      };
      
      setMembers([...members, formattedMember]);
      setEmail('');
      toast.success('Invitation sent successfully');
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateStatus = async (memberId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status })
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, status } : m
      ));
      toast.success('Member status updated');
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role } : m
      ));
      toast.success('Member role updated');
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Team Members ({members.length})
        </h2>
        
        {isOwner && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter email to invite"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={handleAddMember}
              disabled={addingMember}
              className="flex items-center gap-1"
            >
              <UserPlusIcon className="h-4 w-4" />
              {addingMember ? 'Adding...' : 'Add'}
            </Button>
          </div>
        )}
      </div>
      
      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No team members yet. {isOwner && 'Invite someone to join your project!'}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <li key={member.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatar_url} alt={member.user?.full_name || ''} />
                      <AvatarFallback>{member.user?.full_name?.charAt(0) || ''}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.user?.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {member.status}
                    </span>
                    
                    {(isOwner || user?.id === member.user_id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwner && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </>
                          )}
                          {member.status === 'pending' && user?.id === member.user_id && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, 'active')}>
                                <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                                Accept Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleUpdateStatus(member.id, 'inactive')}
                              >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Decline
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}