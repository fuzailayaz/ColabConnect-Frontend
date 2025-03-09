'use client';
import Image from 'next/image';
import { useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  bio: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  stats: {
    projectsCompleted: number;
    tasksCompleted: number;
    teamCollaborations: number;
  };
}

interface UserProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
}

export default function UserProfileCard({ profile, onEdit }: UserProfileCardProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="rounded-full"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{profile.role}</p>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {showMore ? profile.bio : `${profile.bio.slice(0, 150)}...`}
            <button
              onClick={() => setShowMore(!showMore)}
              className="ml-2 text-blue-600 hover:underline"
            >
              {showMore ? 'Show less' : 'Show more'}
            </button>
          </p>

          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.stats.projectsCompleted}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Projects
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.stats.tasksCompleted}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tasks
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.stats.teamCollaborations}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Teams
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {/* Add similar blocks for LinkedIn and Twitter */}
          </div>
        </div>
      </div>
    </div>
  );
}
