// src/app/dashboard/projects/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, useCallback } from 'react'; // Added useCallback
import { motion } from 'framer-motion';
import { Plus, Search, Grid, List, UserPlus, Check, Clock, AlertCircle } from 'lucide-react'; // Added icons
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/types/database'; // Import Tables type
import JoinRequestModal from '@/components/projects/JoinRequestModal'; // Import the new modal
import { toast } from 'react-hot-toast';

// Use Tables helper type for Project
type Project = Tables<'projects'>;
type TeamMemberStatus = Tables<'team_members'>['status'] | 'owner' | 'not_member' | 'rejected'; // Add 'owner' and 'not_member'

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState<Project | null>(null);

  // State to store user's relationship with each project
  const [userProjectStatuses, setUserProjectStatuses] = useState<Map<string, TeamMemberStatus>>(new Map());
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  // Fetch projects and user statuses
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setLoadingStatuses(false);
      setProjects([]);
      setUserProjectStatuses(new Map());
      return;
    }

    setLoading(true);
    setLoadingStatuses(true);
    setError(null);

    try {
      // Fetch Projects first (RLS handles visibility)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const processedProjects = (projectsData || []).map((project): Project => ({
        ...project,
        tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
        required_skills: Array.isArray(project.required_skills) ? project.required_skills : [],
        team_size: project.team_size || 1, // Ensure team_size is handled
        description: project.description || '',
      }));
      setProjects(processedProjects);

      // Fetch User's Statuses for these projects
      const projectIds = processedProjects.map(p => p.id);
      if (projectIds.length > 0) {
        const { data: statusesData, error: statusesError } = await supabase
          .from('team_members')
          .select('project_id, status, role') // Select role too
          .eq('user_id', user.id)
          .in('project_id', projectIds);

        if (statusesError) {
          console.error("Error fetching user statuses:", statusesError);
          // Continue without status info, maybe show error later
        }

        const statusMap = new Map<string, TeamMemberStatus>();
        statusesData?.forEach(s => {
          if (s.project_id) {
            // Prioritize owner role display if applicable, otherwise use DB status
            const derivedStatus: TeamMemberStatus = s.role === 'owner' ? 'owner' : s.status;
             statusMap.set(s.project_id, derivedStatus);
          }
        });
         setUserProjectStatuses(statusMap);
      } else {
         setUserProjectStatuses(new Map()); // No projects, empty map
      }

    } catch (error: any) {
      console.error('Error fetching projects data:', error);
      setError(error.message || 'Failed to load projects');
      setProjects([]);
       setUserProjectStatuses(new Map());
    } finally {
      setLoading(false);
      setLoadingStatuses(false);
    }
  }, [user]); // Depend on user

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run fetchData when it changes (effectively on user change)


  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateProject = () => {
    router.push('/dashboard/projects/new');
  };

  const handleProjectClick = (project: Project) => { // Pass the whole project
    router.push(`/dashboard/projects/${project.id}`);
  };

  // Modal handlers
  const handleOpenJoinModal = (project: Project) => {
    setSelectedProjectForJoin(project);
    setShowJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setSelectedProjectForJoin(null);
  };

   // Callback after successful request submission
  const handleJoinRequestSuccess = () => {
      if (selectedProjectForJoin) {
          // Update local state immediately to show "Pending" status
          setUserProjectStatuses(prev => new Map(prev).set(selectedProjectForJoin.id, 'pending'));
          toast.success(`Request sent for ${selectedProjectForJoin.name}`);
      }
  };

  // Determine button/status to show for a project
  const getProjectInteraction = (project: Project): React.ReactNode => {
     if (!user || loadingStatuses) return <Button size="sm" variant="outline" disabled>Loading...</Button>; // Show loading state

     const userStatus = userProjectStatuses.get(project.id);
     const isOwner = project.owner_id === user.id;

     if (isOwner || userStatus === 'owner') { // Check owner explicitly and from fetched status
        return <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Owner</span>;
     }
     if (userStatus === 'active' || userStatus === 'inactive') { // Assuming 'active' means member
         return <Button size="sm" variant="ghost" disabled className="text-green-600"> <Check className="w-3 h-3 mr-1"/> Member</Button>;
     }
     if (userStatus === 'pending') {
          return <Button size="sm" variant="ghost" disabled className="text-yellow-600"><Clock className="w-3 h-3 mr-1"/> Pending</Button>;
     }
      if (userStatus === 'rejected') {
         // Option 1: Show rejected status (user can't request again from here easily)
         // return <Button size="sm" variant="ghost" disabled className="text-red-600"><XCircle className="w-3 h-3 mr-1"/> Rejected</Button>;
         // Option 2: Allow requesting again (treat same as not_member)
      }

     // If none of the above, user is not associated or was rejected (and we allow re-requesting)
     return (
       <Button
         size="sm"
         variant="outline"
         onClick={(e) => {
           e.stopPropagation(); // Prevent card click navigation
           handleOpenJoinModal(project);
         }}
       >
         <UserPlus className="w-3 h-3 mr-1"/> Request to Join
       </Button>
     );
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Projects</h1> {/* Updated Title */}
          <p className="text-gray-500 dark:text-gray-400">Find projects to collaborate on</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Project
        </Button>
      </div>

      {/* Filters and Search */}
      {/* ... (search and view toggle remain the same) ... */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects by name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'grid' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
        </div>

      {/* Loading and Error States */}
      {(loading || loadingStatuses) && ( // Show loading if either projects or statuses are loading
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

       {!loading && !loadingStatuses && error && ( // Show error only when loading is complete
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
           <div className="flex items-center">
               <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
               <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading projects</h3>
           </div>
           <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-7">{error}</p>
           <button
             onClick={fetchData} // Use fetchData to retry
             className="mt-2 ml-7 text-sm text-red-600 dark:text-red-300 hover:underline"
           >
             Try again
           </button>
         </div>
       )}


      {/* Projects Grid/List */}
       {!loading && !loadingStatuses && !error && ( // Render only when loading is fully complete and no error
        filteredProjects.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No projects found matching your criteria.
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout // Add layout animation
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} // Simple exit animation
                // Removed whileHover scale as it conflicts slightly with layout animation
                className="h-full"
              >
                {/* Pass project data to Card */}
                <Card className="h-full flex flex-col overflow-hidden border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Make header clickable, but stop propagation for button */}
                    <CardHeader onClick={() => handleProjectClick(project)} className="cursor-pointer">
                        <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-1 flex-1 mr-2">{project.name}</CardTitle>
                            {/* Status Badge */}
                            <span className={`capitalize flex-shrink-0 font-medium text-xs px-2 py-0.5 rounded ${
                                project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                project.status === 'planning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {project.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 pt-1">
                          {project.description}
                        </p>
                    </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
  {/* Tech Stack */}
  <div
    className="flex flex-wrap gap-1 cursor-pointer"
    onClick={() => handleProjectClick(project)}
  >
    {project.tech_stack?.slice(0, 5).map((tech) => (
      <span
        key={tech}
        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap"
      >
        {tech}
      </span>
    ))}
    {project.tech_stack && project.tech_stack.length > 5 && (
      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
        + {project.tech_stack.length - 5} more
      </span>
    )}
  </div>

  {/* Bottom section with details and action button */}
  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
    {/* Details Row */}
    <div
      className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
      onClick={() => handleProjectClick(project)}
    >
      <span>
        {project.team_size} member{project.team_size !== 1 ? 's' : ''}
      </span>
      <span
        className={`capitalize text-xs px-2 py-0.5 rounded ${
          project.visibility === 'public'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            : project.visibility === 'private'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        }`}
      >
        {project.visibility.replace('_', ' ')}
      </span>
      <span className="text-xs hidden sm:inline">{project.project_type}</span>
    </div>

    {/* Action Button Row */}
    <div className="flex justify-end pt-2">
      {getProjectInteraction(project)}
    </div>
  </div>
</CardContent>

                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Join Request Modal */}
      {selectedProjectForJoin && (
        <JoinRequestModal
          isOpen={showJoinModal}
          onClose={handleCloseJoinModal}
          projectId={selectedProjectForJoin.id}
          projectName={selectedProjectForJoin.name}
           onSuccess={handleJoinRequestSuccess} // Pass the success handler
        />
      )}
    </div>
  );
}