'use client';
import Image from 'next/image';
import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
}

interface TeamProps {
  team: {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    projectCount: number;
    created_at: string;
  };
}

export default function TeamCard({ team }: TeamProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {team.name}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
            {team.projectCount} Projects
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {team.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {team.members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="flex items-center bg-gray-50 dark:bg-[#2C2C2E] rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors duration-200"
            >
              <div className="relative w-6 h-6 mr-2">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  fill
                  className="rounded-full"
                />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {member.name}
              </span>
            </div>
          ))}
          {team.members.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[#3ECF8E] dark:text-[#3ECF8E] hover:opacity-80 transition-opacity duration-200"
            >
              +{team.members.length - 3} more
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            {team.members.slice(3).map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-[#2C2C2E] rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="relative w-8 h-8 mr-3">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-200 dark:bg-gray-600 rounded px-2 py-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
