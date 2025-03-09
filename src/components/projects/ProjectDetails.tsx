import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api, getUserProfile } from "@/utils/api";
import Button from "@/components/ui/Button";

import { CalendarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const ProjectDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProjectDetails = async () => {
      try {
        const response = await api.get(`/projects/${id}`); // Replace with your API call
        setProject(response.data);
      } catch {
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : project.status === "completed"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          }`}
        >
          {project.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <p className="mt-4 text-gray-700 dark:text-gray-300">{project.description}</p>

      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <CalendarIcon className="h-5 w-5 mr-2" />
          <span>{format(new Date(project.deadline), "MMM dd, yyyy")}</span>
        </div>

        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
          <div className="flex -space-x-2">
            {project.team_members.slice(0, 3).map((member: any) => (
              <div
                key={member.id}
                className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
              >
                {member.avatar ? (
                  <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {project.team_members.length > 3 && (
              <div className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{project.team_members.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={async () => { router.push("/dashboard/projects"); }}>
          Back to Projects
        </Button>
        <Button onClick={async () => { /* Add your update project logic here */ }}>
          Update Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetails;
