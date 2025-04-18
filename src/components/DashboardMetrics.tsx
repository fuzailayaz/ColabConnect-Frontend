"use client";

import { Tables } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, Users, Award } from "lucide-react";

interface DashboardMetricsProps {
  projects: Tables<'projects'>[];
}

export default function DashboardMetrics({ projects }: DashboardMetricsProps) {
  // Calculate metrics from projects
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const teamCollaborations = projects.reduce((acc, project) => acc + (project.team_size || 0), 0);
  const completionRate = projects.length > 0 
    ? Math.round((completedProjects / projects.length) * 100) 
    : 0;

  const metrics = [
    {
      title: "Active Projects",
      value: activeProjects,
      icon: <Activity className="h-5 w-5" />,
      progress: Math.min(100, (activeProjects / Math.max(1, projects.length)) * 100),
      color: "text-green-500"
    },
    {
      title: "Team Collaborations",
      value: teamCollaborations,
      icon: <Users className="h-5 w-5" />,
      progress: Math.min(100, (teamCollaborations / (projects.length * 3)) * 100),
      color: "text-blue-500"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: <CheckCircle className="h-5 w-5" />,
      progress: completionRate,
      color: "text-purple-500"
    },
    {
      title: "Project Health",
      value: projects.length > 0 ? "Good" : "N/A",
      icon: <Award className="h-5 w-5" />,
      progress: 85, // This would normally come from project health calculations
      color: "text-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card 
          key={index}
          className="hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.title}
            </CardTitle>
            <div className={metric.color}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{metric.value}</div>
            <div className="mt-4">
              <Progress 
                value={metric.progress} 
                className={`h-2 ${metric.color.replace('text', 'bg')}${metric.progress > 90 ? ' animate-pulse' : ''}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}    </div>
  );
}