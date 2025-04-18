import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api } from "@/utils/api"; // Correct: Import the api object
import Button from "@/components/ui/button";
import { CalendarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Define a type/interface for your project structure for better type safety
interface TeamMember {
  id: string; // Or number, depending on your data
  name: string;
  avatar?: string | null; // Avatar URL might be optional
  // Add other relevant member properties if needed (e.g., role)
}

interface Project {
  id: string; // Or number
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold'; // Match your DB enum/check constraint
  progress?: number; // Progress might be calculated or stored
  deadline: string | Date; // Store as ISO string or Date object
  team_members: TeamMember[]; // Use the TeamMember interface
  // Add any other properties from your project data (e.g., github_url, tech_stack)
}


const ProjectDetails = () => {
  const router = useRouter();
  const { id } = router.query; // 'id' can be string | string[] | undefined

  // Use the Project interface for better typing
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // router.query might be empty on initial render, then populated.
    // Also check if 'id' is actually a string before using it.
    if (typeof id !== 'string') {
      // If id is not yet available, just return and wait for the next effect run.
      // If id is an array or something unexpected after router is ready, you might want to set an error.
      if (router.isReady && id !== undefined) {
         console.error("Invalid project ID in URL:", id);
         setError("Invalid project route parameter.");
         setLoading(false);
      }
      return; // Exit if id is not a string yet or if it's invalid
    }

    const fetchProjectDetails = async (projectId: string) => {
      setLoading(true); // Start loading indicator
      setError(null);   // Clear previous errors
      try {
        // Use the specific function from the imported 'api' object
        const projectData = await api.getProjectById(projectId);
        setProject(projectData); // Set the fetched project data
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        // Set a user-friendly error message, potentially using err.message
        setError(err instanceof Error ? err.message : "Failed to load project details. Please try again later.");
      } finally {
        setLoading(false); // Stop loading indicator regardless of success/failure
      }
    };

    fetchProjectDetails(id); // Call fetch function with the validated string id

  }, [id, router.isReady]); // Add router.isReady to dependencies to ensure query params are available

  // --- Render Logic ---

  if (loading) {
     return <div className="flex justify-center items-center h-40"><p className="text-gray-500 dark:text-gray-400">Loading project details...</p></div>;
  }

  if (error) {
     return <div className="flex justify-center items-center h-40"><p className="text-center text-red-600 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900 rounded border border-red-300 dark:border-red-700">Error: {error}</p></div>;
  }

  // Important: Check if project data exists *after* loading and no error
  if (!project) {
     return <div className="flex justify-center items-center h-40"><p className="text-gray-500 dark:text-gray-400">Project not found or could not be loaded.</p></div>;
  }

  // Helper function for status badge classes
  const getStatusClasses = (status: Project['status']) => {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "completed":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        case "on_hold":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        case "planning":
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // --- Main Return ---
  return (
    <div className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto my-6 border border-gray-200 dark:border-gray-700">
      {/* Header: Title and Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex-1 break-words">
          {project.title}
        </h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusClasses(project.status)}`}
        >
          {/* Replace underscores if status comes from an older source, otherwise just capitalize */}
          {project.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-700 dark:text-gray-300 mb-6">{project.description}</p>

      {/* Progress Bar (Optional: only show if progress exists) */}
      {project.progress !== undefined && project.progress !== null && (
          <div className="mt-4 mb-6">
              <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              />
              </div>
          </div>
      )}

      {/* Meta Info: Deadline and Team */}
      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-4 items-start sm:items-center">
        {/* Deadline */}
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <CalendarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">Deadline: {format(new Date(project.deadline), "PPP")}</span> {/* More readable format */}
        </div>

        {/* Team Members */}
        {project.team_members && project.team_members.length > 0 && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
                <UserGroupIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm mr-2">Team:</span>
                <div className="flex -space-x-2 items-center">
                    {project.team_members.slice(0, 4).map((member) => ( // Show up to 4 avatars
                    <div
                        key={member.id}
                        title={member.name} // Add tooltip for name
                        className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-600"
                    >
                        {member.avatar ? (
                        <Image src={member.avatar} alt={member.name} fill sizes="32px" className="object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                        )}
                    </div>
                    ))}
                    {project.team_members.length > 4 && (
                    <div className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-10">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{project.team_members.length - 4}
                        </span>
                    </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>
          Back to Projects
        </Button>
        <Button onClick={() => { /* Add your update project logic here - maybe navigate to an edit page */ console.log("Update project clicked"); }}>
          Update Project
        </Button>
        {/* Add other actions like 'View Tasks', 'Leave Project' etc. as needed */}
      </div>
    </div>
  );
};

export default ProjectDetails;