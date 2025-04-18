// src/app/dashboard/projects/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client'; // Use consistent path
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Use lucide-react consistently
import {
  ArrowLeft, // Replaced ArrowLeftIcon
  Users, // Replaced UserGroupIcon
  Calendar,  // Replaced CalendarIcon
  Link as LinkIconLucide, // Alias Link to avoid conflict with Nextjs Link
  Pencil,    // Replaced PencilIcon
  Trash2,    // Replaced TrashIcon (use Trash2 for similar style)
  UserPlus,  // Already using from lucide
  Clock,     // Already using from lucide
  CheckCircle, // Already using from lucide
  XCircle,     // Already using from lucide
  Inbox,     // Replaced InboxIcon
  Loader2    // Already using from lucide
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import ProjectTeam from '@/components/projects/ProjectTeam'; // Assuming this exists and works
import ProjectUpdates from '@/components/projects/ProjectUpdates'; // Assuming this exists and works
import ProjectTasks from '@/components/projects/ProjectTasks'; // Assuming this exists and works
import JoinRequestModal from '@/components/projects/JoinRequestModal'; // Import modal
import { Tables, Database } from '@/types/database'; // Import generated types (ensure regenerated)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For requester avatar
import { UserGroupIcon } from '@heroicons/react/24/outline';

type Project = Tables<'projects'>;

// Combine team_member info with profile info for pending requests display
// This type assumes database.ts is REGENERATED and includes request_message in team_members
type PendingRequest = Tables<'team_members'> & {
    profiles: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null;
};

// Assuming 'team_members' status ENUM in DB now includes 'rejected'
type TeamMemberStatus = Tables<'team_members'>['status'] | 'owner' | 'not_member' | 'rejected'; // Adjusted type based on DB changes

// Removed unused BaseRequest type

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // Default back to overview initially
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] = useState<TeamMemberStatus | null>(null);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchProjectData = useCallback(async () => {
    // ... (fetch logic remains largely the same)
    if (!id || !user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setCurrentUserStatus(null);
      setIsOwnerOrAdmin(false);
      setPendingRequests([]); // Reset requests on fetch

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) {
            // Handle specific errors like project not found (406)
            if (projectError.code === 'PGRST116') { // PostgREST code for no rows found
                toast.error('Project not found or access denied.');
                setProject(null); // Ensure project is null
            } else {
                 throw projectError; // Throw other errors
            }
        } else {
             setProject(projectData);
        }

        // Proceed only if project was found
        if (projectData) {
            const { data: membershipData, error: membershipError } = await supabase
              .from('team_members')
              .select('status, role')
              .eq('project_id', id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (membershipError) {
              console.error("Error fetching user membership:", membershipError);
            }

            let status: TeamMemberStatus = 'not_member';
            // Check owner_id first as the definitive source of ownership
            let isOwnerAdminCheck = projectData.owner_id === user.id;

            if (membershipData) {
                // Use DB status, but owner role takes precedence for isOwnerAdmin flag
                status = membershipData.status as TeamMemberStatus; // Cast based on DB enum
                if (membershipData.role === 'owner' || membershipData.role === 'admin') {
                    isOwnerAdminCheck = true;
                }
                 // If user is owner, status should reflect that regardless of team_members entry
                if (projectData.owner_id === user.id) {
                    status = 'owner';
                }

            } else if (projectData.owner_id === user.id) {
                 // If user is owner but NOT in team_members (unlikely but possible)
                 status = 'owner';
            }

            setCurrentUserStatus(status);
            setIsOwnerOrAdmin(isOwnerAdminCheck);

            // Fetch pending requests IF user is owner/admin
            if (isOwnerAdminCheck) {
              // Don't force tab change, let user decide, but fetch data
              // setActiveTab('requests');
              setLoadingRequests(true);
              const { data: requestsData, error: requestsError } = await supabase
                .from('team_members')
                .select(`
                  *,
                  profiles ( id, full_name, avatar_url )
                `)
                .eq('project_id', id)
                .eq('status', 'pending'); // Fetch only pending

              if (requestsError) {
                   console.error("Error fetching pending requests:", requestsError);
                   toast.error("Could not load pending requests.");
              } else {
                   setPendingRequests(requestsData as PendingRequest[] || []);
              }
              setLoadingRequests(false);
            }

             // Record view (Handle potential errors gracefully)
             try {
                // Example: Check if 'views' column exists before trying to increment
                // Or use an RPC function that handles this safely
                // await supabase.rpc('increment_project_views', { project_id_input: id });
                console.log("View increment logic placeholder.");
            } catch (viewError) {
                console.warn("Could not increment project view:", viewError);
            }
        } // End if(projectData)

      } catch (error: any) {
        console.error('Error fetching project details:', error);
        // Avoid setting project data on generic error
        setProject(null); // Ensure project is null on failure
        toast.error(error.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
  }, [id, user?.id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // --- Request Handling Functions (handleAcceptRequest, handleRejectRequest) ---
  // ... (Keep these functions as they were, they look okay) ...
    const handleAcceptRequest = async (teamMemberId: string) => {
      setProcessingRequestId(teamMemberId);
      try {
        const { error } = await supabase
          .from('team_members')
          .update({ status: 'active', role: 'member' }) // Also set role to member on acceptance
          .eq('id', teamMemberId)
          .eq('status', 'pending');

        if (error) throw error;
        toast.success('Request accepted!');
        setPendingRequests(prev => prev.filter(req => req.id !== teamMemberId));
        // Optionally refetch team members if the ProjectTeam component doesn't auto-update
      } catch (error: any) {
        console.error("Error accepting request:", error);
        toast.error(error.message || "Failed to accept request.");
      } finally {
        setProcessingRequestId(null);
      }
    };

    const handleRejectRequest = async (teamMemberId: string) => {
       setProcessingRequestId(teamMemberId);
       try {
         // Use UPDATE to 'rejected' status
         const { error } = await supabase
           .from('team_members')
           .update({ status: 'rejected' }) // Change status to rejected
           .eq('id', teamMemberId)
           .eq('status', 'pending');

         if (error) throw error;
         toast.success('Request rejected.');
         setPendingRequests(prev => prev.filter(req => req.id !== teamMemberId));
       } catch (error: any) {
         console.error("Error rejecting request:", error);
         toast.error(error.message || "Failed to reject request.");
       } finally {
         setProcessingRequestId(null);
       }
    };

  // --- Modal Handling (handleOpenJoinModal, handleCloseJoinModal, handleJoinRequestSuccess) ---
  // ... (Keep these functions as they were) ...
     const handleOpenJoinModal = () => {
         if (project) {
             setShowJoinModal(true);
         }
     };

     const handleCloseJoinModal = () => {
         setShowJoinModal(false);
     };

     const handleJoinRequestSuccess = () => {
         setCurrentUserStatus('pending');
         // Optionally refetch project data if needed, but usually just updating status is enough
     };

  // --- Delete Project Handler (handleDelete) ---
  // ... (Keep this function as it was) ...
    const handleDelete = async () => {
        if (!project) return;
        if (!confirm(`Are you sure you want to delete project "${project.name}"? This cannot be undone.`)) return;

        const toastId = toast.loading('Deleting project...');
        try {
          setLoading(true);
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) throw error;

          toast.success('Project deleted successfully', { id: toastId });
          router.push('/dashboard/projects');
        } catch (error: any) {
          console.error('Error deleting project:', error);
          toast.error(error.message || 'Failed to delete project', { id: toastId });
          setLoading(false);
        }
      };


  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  // --- Render Project Not Found ---
  if (!project) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-xl text-red-600 mb-4">Project Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The project you are looking for does not exist or you do not have permission to view it.
              </p>
              <Button onClick={() => router.push('/dashboard/projects')}>
                   <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
              </Button>
          </div>
      );
  }


  // --- Render Join Button/Status ---
   const renderJoinInteraction = () => {
       // Don't show button while status is still loading/null
       if (currentUserStatus === null) return null;

       if (currentUserStatus === 'owner' || currentUserStatus === 'active') {
           return null; // Owner or already an active member
       }
       if (currentUserStatus === 'pending') {
           return <Button variant="outline" disabled><Clock className="w-4 h-4 mr-2"/> Request Pending</Button>;
       }
        if (currentUserStatus === 'rejected') {
           return <Button variant="outline" disabled className="text-red-500 border-red-500"><XCircle className="w-4 h-4 mr-2"/> Request Rejected</Button>;
       }
       // If 'not_member' or 'inactive' (treat inactive as can request again)
       return <Button onClick={handleOpenJoinModal}><UserPlus className="w-4 h-4 mr-2"/> Request to Join</Button>;
   };


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button & Edit/Delete */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> {/* Use Lucide icon */}
          Back
        </button>

        <div className="flex items-center gap-2">
            {/* Show Join Button if applicable */}
            {renderJoinInteraction()} {/* Call the render function */}

            {/* Show Owner Actions if applicable */}
            {isOwnerOrAdmin && (
                <>
                  {/* Edit Button - Add later if needed */}
                  {/* <Button ...> <Pencil .../> Edit </Button> */}
                  <Button
                    variant="ghost" // Use destructive variant for delete
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> {/* Use Lucide icon */}
                    Delete Project
                  </Button>
               </>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Project Header */}
        <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
             {/* ... (Project name, badges, github link - check icons used) ... */}
             <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                 <div>{/* ... Name and Badges ... */}</div>
                  {project.github_url && (
                    <a href={project.github_url} /* ... */ >
                       <LinkIconLucide className="h-4 w-4 mr-1" /> {/* Use Aliased Lucide icon */}
                       View on GitHub
                    </a>
                  )}
             </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                {project.description}
              </p>
        </div>

        {/* Project Details & Tabs */}
        <div className="p-6 md:p-8">
           {/* Grid for Tech Stack, Skills, Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 {/* Tech Stack Card */}
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                     {/* ... content ... */}
                 </div>
                 {/* Required Skills Card */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {/* ... content ... */}
                  </div>
                 {/* Project Info Card */}
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"> Project Info </h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" /> {/* Use Lucide icon */}
                          <span>Team Size: {project.team_size || 'N/A'}</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" /> {/* Use Lucide icon */}
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                         {!project.deadline && (
                             <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 italic">
                               <Calendar className="h-4 w-4 mr-2 text-gray-400" /> {/* Use Lucide icon */}
                               <span>No deadline set</span>
                             </div>
                         )}
                      </div>
                 </div>
            </div>


          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
               {/* Requests Tab (Conditional) */}
              {isOwnerOrAdmin && (
  <button onClick={() => setActiveTab('requests')} /* ... styles ... */>
    <Inbox className="h-4 w-4 mr-1 inline-block" /> {/* Use Lucide icon */}
    Requests
    {pendingRequests.length > 0 && (
      <span className="badge">
        {/* Example content */}
        {pendingRequests.length} Pending
      </span>
    )}
  </button>
)}

               {/* Overview Tab */}
              <button onClick={() => setActiveTab('overview')} /* ... styles ... */ >
                Overview
              </button>
               {/* Team Tab */}
              <button onClick={() => setActiveTab('team')} /* ... styles ... */ >
                 Team
              </button>
               {/* Updates Tab */}
              <button onClick={() => setActiveTab('updates')} /* ... styles ... */ >
                  Updates
              </button>
               {/* Tasks Tab */}
              <button onClick={() => setActiveTab('tasks')} /* ... styles ... */ >
                  Tasks
              </button>
            </nav>
          </div>

          {/* Tab Content Area */}
          <div>
            {/* FIX: Overview Tab Content */}
            {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Project Overview
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                    {project.description || 'No detailed overview provided.'}
                  </p>
                  {/* You might add more overview details here */}
              </div>
            )}

            {/* FIX: Team Tab Content */}
            {activeTab === 'team' && (
                <ProjectTeam projectId={id} isOwner={isOwnerOrAdmin} /> // FIX: Pass isOwnerOrAdmin
            )}

            {/* Updates & Tasks Tabs */}
            {activeTab === 'updates' && <ProjectUpdates projectId={id} />}
            {activeTab === 'tasks' && <ProjectTasks projectId={id} />}

             {/* Requests Tab Content (Conditional) */}
             {isOwnerOrAdmin && activeTab === 'requests' && (
               <div>
                 <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                   Pending Join Requests ({pendingRequests.length})
                 </h2>
                 {loadingRequests ? (
                   <div className="flex justify-center items-center p-6"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
                 ) : pendingRequests.length === 0 ? (
                   <p className="text-gray-500 dark:text-gray-400 italic">No pending join requests.</p>
                 ) : (
                   <div className="space-y-4">
                     {pendingRequests.map((request) => ( // request is PendingRequest type
                       <div key={request.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                         <div className="flex items-center justify-between gap-4 flex-wrap">
                           {/* Requester Info */}
                           <div className="flex items-center space-x-3">
                             <Avatar className="h-10 w-10">
                               <AvatarImage src={request.profiles?.avatar_url || undefined} alt={request.profiles?.full_name || 'User'}/>
                               <AvatarFallback>{request.profiles?.full_name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{request.profiles?.full_name || 'Unknown User'}</p>
                               {/* Ensure joined_at exists on team_members type */}
                               <p className="text-xs text-gray-500 dark:text-gray-400">Requested on {new Date(request.joined_at).toLocaleDateString()}</p>
                             </div>
                           </div>
                           {/* Action Buttons */}
                           <div className="flex items-center gap-2 flex-shrink-0">
                             <Button
                               size="sm" variant="outline"
                               className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30"
                               onClick={() => handleRejectRequest(request.id)} // Use request.id (team_member id)
                               disabled={processingRequestId === request.id}
                             >
                               {processingRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4"/>}
                               <span className="ml-1">Reject</span>
                             </Button>
                             <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                                onClick={() => handleAcceptRequest(request.id)} // Use request.id (team_member id)
                                disabled={processingRequestId === request.id}
                             >
                               {processingRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
                               <span className="ml-1">Accept</span>
                             </Button>
                           </div>
                         </div>
                         {/* FIX: Request Message - Check if request_message exists after regenerating types */}
                         {request.request_message && (
                             <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 border-l-2 border-gray-200 dark:border-gray-600 ml-5 pl-3 py-1 italic">
                                 "{request.request_message}"
                             </div>
                         )}
                          {!request.request_message && ( // Show if no message provided
                             <div className="mt-3 text-sm text-gray-400 dark:text-gray-500 border-l-2 border-gray-200 dark:border-gray-600 ml-5 pl-3 py-1 italic">
                                 No message provided.
                             </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      {project && (
          <JoinRequestModal
              isOpen={showJoinModal}
              onClose={handleCloseJoinModal}
              projectId={project.id}
              projectName={project.name}
              onSuccess={handleJoinRequestSuccess}
          />
      )}
    </div>
  );
}