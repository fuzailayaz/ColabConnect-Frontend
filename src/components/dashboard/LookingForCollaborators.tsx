'use client';

import { useState, useEffect } from 'react';
import { supabase, getProjects } from '@/utils/api'; // Import Supabase & Projects API
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { syncActivity } from '@/utils/api';

interface ProjectSeekingCollaborators {
  id: string;
  name: string;
  description: string;
  skillsNeeded: string[];
}

const LookingForCollaborators = () => {
  const [projects, setProjects] = useState<ProjectSeekingCollaborators[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch projects from API
        const projectsData = await getProjects();
        
        // Safely map the data with fallbacks for missing properties
        const formattedProjects = (projectsData || []).map((project: any) => ({
          id: project.id || `temp-${Date.now()}`,
          name: project.name || 'Untitled Project',
          description: project.description || 'No description available',
          skillsNeeded: project.skillsNeeded || project.required_skills || []
        }));
        
        setProjects(formattedProjects);
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
        // Set empty array on error to avoid undefined
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Seeking Collaborators</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : projects.length === 0 ? (
          <p>No projects currently seeking collaborators.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="mb-4">
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm">{project.description}</p>
                <p className="text-xs">Skills Needed: {project.skillsNeeded.join(', ')}</p>
                <Button onClick={() => { /* Navigate to project details */ }}>
                  <Users className="mr-2" /> View Project
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default LookingForCollaborators;
