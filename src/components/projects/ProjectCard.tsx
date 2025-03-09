import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    progress: number;
    deadline: string;
    team_members: Array<{
      id: number;
      name: string;
      avatar: string;
    }>;
  };
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg
                   border border-gray-100 dark:border-gray-700 transition-all duration-300"
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {project.title}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[project.status]
              }`}
            >
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {project.description}
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Meta Information */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              {/* Deadline */}
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
              </div>

              {/* Team Members */}
              <div className="flex items-center -space-x-2">
                {project.team_members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                  >
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
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
        </div>
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
