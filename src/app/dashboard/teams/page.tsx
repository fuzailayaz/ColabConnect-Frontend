'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import TeamCard from '@/components/TeamCard';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  projectCount: number;
  created_at: string;
}

// Mock data for development
const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Frontend Team',
    description: 'Responsible for user interface development',
    members: [
      {
        id: '1',
        name: 'John Doe',
        role: 'Lead Developer',
        avatar: '/avatars/default.png',
        skills: ['React', 'TypeScript', 'Tailwind'],
      },
    ],
    projectCount: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Backend Team',
    description: 'API and database development team',
    members: [
      {
        id: '2',
        name: 'Jane Smith',
        role: 'Backend Developer',
        avatar: '/avatars/default.png',
        skills: ['Python', 'Django', 'PostgreSQL'],
      },
    ],
    projectCount: 2,
    created_at: new Date().toISOString(),
  },
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // Comment out API call for now and use mock data
      // const response = await api.get<Team[]>('/api/teams/teams/');
      // setTeams(response.data);
      
      // Use mock data instead
      setTeams(mockTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Fallback to mock data on error
      setTeams(mockTeams);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}