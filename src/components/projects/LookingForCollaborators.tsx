'use client';

import { useState, useEffect } from 'react';
import { syncActivity } from '@/utils/api';
import { Activity } from '@/types/activity';

interface Project {
  id: string;
  name: string;
  description: string;
  required_skills: string[];
  owner_id: string;
}

interface LookingForCollaboratorsProps {
  userId: string;
}

export default function LookingForCollaborators({ userId }: LookingForCollaboratorsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch projects that are looking for collaborators
        const response = await fetch('/api/projects/looking-for-collaborators');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.projects);
        
        // Track this activity using the client-side API function
        const activity: Activity = {
          type: 'project_updated',
          userId,
          details: { action: 'viewed_collaborator_projects' }
        };
        
        await syncActivity({ activity });
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  const handleProjectInterest = async (projectId: string) => {
    try {
      // Handle user expressing interest in a project
      const response = await fetch('/api/projects/express-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to express interest');
      }

      // Track this activity
      const activity: Activity = {
        type: 'project_updated',
        userId,
        projectId,
        details: { action: 'expressed_interest' }
      };
      
      await syncActivity({ activity });
      
      // Show success message or update UI
      alert('Interest expressed successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error expressing interest:', err);
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Projects Looking for Collaborators</h2>
      
      {projects.length === 0 ? (
        <p>No projects are currently looking for collaborators.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{project.description}</p>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium">Required Skills:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.required_skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => handleProjectInterest(project.id)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Express Interest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}