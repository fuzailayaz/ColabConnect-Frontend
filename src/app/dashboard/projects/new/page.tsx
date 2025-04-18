// src/app/dashboard/projects/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import MultiSelect from '@/components/ui/MultiSelect';

interface MultiSelectOption {
  value: string;
  label: string;
}

export default function NewProject() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    visibility: 'public',
    tech_stack: [] as string[],
    required_skills: [] as string[],
    team_size: 1,
    deadline: '',
    github_url: '',
    project_type: 'personal'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to create a project');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          visibility: formData.visibility,
          tech_stack: formData.tech_stack,
          required_skills: formData.required_skills,
          team_size: Number(formData.team_size),
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          github_url: formData.github_url,
          project_type: formData.project_type,
          owner_id: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          project_id: projectData.id,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        });

      if (teamError) throw teamError;

      toast.success('Project created successfully!');
      router.push(`/dashboard/projects/${projectData.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (name: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  const techStackOptions: MultiSelectOption[] = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'React', label: 'React' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Python', label: 'Python' },
    { value: 'Django', label: 'Django' },
    { value: 'Flask', label: 'Flask' },
  ];

  const requiredSkillsOptions: MultiSelectOption[] = [
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'UI/UX', label: 'UI/UX' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Database', label: 'Database' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'AI/ML', label: 'AI/ML' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>

        {/* Form Container - Theme-aware Background, Rounded Corners, Border */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Create New Project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none shadow-sm"
                    placeholder="Enter project name"
                    required
                  />
                  <DocumentTextIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none shadow-sm"
                  placeholder="Describe your project"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 focus:outline-none appearance-none shadow-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <div className="relative">
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 focus:outline-none appearance-none shadow-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="team_only">Team Only</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tech Stack
                </label>
                <MultiSelect
                  options={techStackOptions}
                  selected={formData.tech_stack}
                  onChange={(selected) => handleArrayChange('tech_stack', selected)}
                  placeholder="Select technologies"
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Required Skills
                </label>
                <MultiSelect
                  options={requiredSkillsOptions}
                  selected={formData.required_skills}
                  onChange={(selected) => handleArrayChange('required_skills', selected)}
                  placeholder="Select required skills"
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                />
              </div>

              {/* Team Size */}
              <div>
                <label htmlFor="team_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Size
                </label>
                <div className="relative">
                  <input
                    id="team_size"
                    name="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none shadow-sm"
                  />
                  <UserGroupIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadline
                </label>
                <div className="relative">
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none pl-10 shadow-sm"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* GitHub URL */}
              <div className="col-span-2">
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub URL
                </label>
                <div className="relative">
                  <input
                    id="github_url"
                    name="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none pl-10 shadow-sm"
                    placeholder="https://github.com/username/repo"
                  />
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Project Type */}
              <div className="col-span-2">
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Type
                </label>
                <div className="relative">
                  <select
                    id="project_type"
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 focus:outline-none appearance-none shadow-sm"
                  >
                    <option value="academic">Academic</option>
                    <option value="personal">Personal</option>
                    <option value="startup">Startup</option>
                    <option value="research">Research</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>* Required fields</p>
                  <p>You'll be automatically added as the owner of this project.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-md text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}