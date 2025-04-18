"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tables } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, ArrowRight, Plus, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
// Removed unused supabase import if fetching happens in parent
// import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

interface ProjectListProps {
  projects?: Tables<'projects'>[]; // Projects are optional
  loading?: boolean;
  limit?: number;
  showViewAll?: boolean;
}

// Helper function to get conditional progress bar indicator classes (Tailwind)
const getProgressIndicatorClass = (value: number | null | undefined): string => {
  const score = value || 0;
  if (score > 70) return '[&>div]:bg-green-500'; // Target indicator div for success
  if (score > 40) return '[&>div]:bg-yellow-500';// Target indicator div for warning
  return '[&>div]:bg-red-500';       // Target indicator div for danger
  // Assumes the Progress indicator is the direct child div. Adjust if structure differs.
  // Alternatively, ensure --primary, --warning, --destructive CSS vars are set by theme.
};

export default function ProjectList({
  projects = [], // Default to empty array
  loading,
  limit,
  showViewAll = false
}: ProjectListProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Tables<'projects'> | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'on_hold' | 'planning'>('all');

  const filteredProjects = projects.filter(project =>
    filter === 'all' ? true : project.status === filter
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i} className="animate-pulse" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 rounded w-3/4" style={{ backgroundColor: theme.secondary, opacity: 0.5 }}></div>
              <div className="h-3 rounded" style={{ backgroundColor: theme.secondary, opacity: 0.5 }}></div>
              <div className="h-3 rounded w-1/2" style={{ backgroundColor: theme.secondary, opacity: 0.5 }}></div>
              <div className="pt-2">
                <div className="h-2 rounded" style={{ backgroundColor: theme.secondary, opacity: 0.5 }}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg" style={{ borderColor: theme.border, color: theme.textMuted }}>
        <p>No projects found</p>
        <Button
          variant="outline"
          className="mt-4 hover:bg-accent hover:text-accent-foreground"
          onClick={() => router.push('/dashboard/projects/new')}
          style={{ borderColor: theme.border, color: theme.text }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>
    );
  }

  const selectStyles = {
    backgroundColor: theme.card,
    borderColor: theme.border,
    color: theme.text
  };
  const cardStyles = {
    backgroundColor: theme.card,
    borderColor: theme.border,
    color: theme.text
  };
  const mutedTextStyles = {
    color: theme.textMuted
  };

  const getStatusBadgeVariant = (status: string): "outline" | "default" | "secondary" | "destructive" | "success" => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'on_hold':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed' | 'on_hold' | 'planning')}
            className="border rounded-lg shadow-sm focus:ring-primary focus:border-primary text-sm p-2 w-full sm:w-auto"
            style={selectStyles}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="planning">Planning</option>
          </select>

          <Button
            onClick={() => router.push('/dashboard/projects/new')}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
          >
            New Project
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.slice(0, limit).map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
              style={cardStyles}
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1" style={{ color: theme.text }}>
                    {project.name}
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm line-clamp-2 mb-4" style={mutedTextStyles}>
                  {project.description || 'No description'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center" style={mutedTextStyles}>
                      <Users className="h-4 w-4 mr-1" />
                      {project.team_size || 0} members
                    </span>
                    <span style={mutedTextStyles}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress
                    value={project.engagement_score || 0}
                    className={`h-2 ${getProgressIndicatorClass(project.engagement_score)}`}
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border"
              style={{ backgroundColor: theme.card, color: theme.text, borderColor: theme.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                    {selectedProject.name}
                  </h2>
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setSelectedProject(null)}
                     className="rounded-full text-muted-foreground hover:bg-accent"
                   >
                     <X className="h-5 w-5" />
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Details</h3>
                    <p className="mb-4 text-sm" style={mutedTextStyles}>
                      {selectedProject.description || 'No description available'}
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span style={mutedTextStyles}>Status</span>
                        <Badge variant={getStatusBadgeVariant(selectedProject.status)}>
                          {selectedProject.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span style={mutedTextStyles}>Team Size</span>
                        <span>{selectedProject.team_size || 0} members</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={mutedTextStyles}>Created</span>
                        <span>{new Date(selectedProject.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={mutedTextStyles}>Domain</span>
                        <span className="capitalize">{selectedProject.engineering_domain}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Progress</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Engagement</span>
                          <span>{selectedProject.engagement_score || 0}%</span>
                        </div>
                        <Progress
                           value={selectedProject.engagement_score || 0}
                           className={`h-2 ${getProgressIndicatorClass(selectedProject.engagement_score)}`}
                           style={{ backgroundColor: theme.secondary }}
                         />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Completion</span>
                          <span>{selectedProject.status === 'completed' ? '100%' : 'In progress'}</span>
                        </div>
                        <Progress
                          value={selectedProject.status === 'completed' ? 100 : 50}
                          className={`h-2 ${selectedProject.status === 'completed' ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'}`}
                          style={{ backgroundColor: theme.secondary }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h3 className="font-semibold text-lg">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech_stack?.length > 0 ? selectedProject.tech_stack.map((tech, i) => (
                          <Badge key={i} variant="outline" style={{ borderColor: theme.border, color: theme.text }}>
                            {tech}
                          </Badge>
                        )) : <span className="text-sm" style={mutedTextStyles}>Not specified</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="hover:bg-accent hover:text-accent-foreground"
                    style={{ borderColor: theme.border, color: theme.text }}
                    onClick={() => {
                      router.push(`/dashboard/projects/${selectedProject.id}`);
                      setSelectedProject(null);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    className="text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.primary }}
                    onClick={() => {
                      router.push(`/dashboard/projects/${selectedProject.id}/tasks`);
                      setSelectedProject(null);
                    }}
                  >
                    Manage Tasks
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showViewAll && projects.length > 0 && limit && projects.length >= limit && (
        <div className="text-center pt-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 dark:hover:text-primary/70 group"
          >
            View all projects
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}