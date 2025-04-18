// Types for activity tracking and analytics

// Activity Types
export type ActivityType = 
  | "project_created"
  | "project_updated"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "team_member_added"
  | "team_member_removed"
  | "skill_added"
  | "skill_updated";

// Activity Interface
export interface Activity {
  id?: string;
  type: ActivityType;
  userId: string;
  projectId?: string;
  taskId?: string;
  teamId?: string;
  timestamp?: Date;
  details?: any;
  metadata: Record<string, unknown>;
}

// Project Analytics Interface
export interface ProjectAnalytics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  activeContributors: number;
  lastActivityDate?: Date;
  contributionByUser: Record<string, number>;
  taskCompletionRate: number;
  lastUpdated?: Date;
  skillDistribution: Record<string, number>;

}

// User Stats Interface
export interface UserStats {
  userId: string;
  projectsContributed: number;
  tasksCompleted: number;
  skillsUsed: string[];
  activeStreak: number;
  lastActiveDate?: Date;
  contributionHistory: Array<{date: Date, count: number}>;
  lastUpdated?: Date;
}