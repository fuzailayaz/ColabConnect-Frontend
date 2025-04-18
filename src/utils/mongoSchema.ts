// Client-safe schema definitions for MongoDB
// No direct MongoDB imports to avoid client-side errors

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
  id: string;
  type: ActivityType;
  userId: string;
  projectId?: string;
  taskId?: string;
  timestamp: Date;
  metadata: any;
}

// Analytics Interface
export interface ProjectAnalytics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  activeMembers: number;
  lastActivityAt: Date;
  engagementScore: number;
  skillDistribution: Record<string, number>;
}

// User Activity Stats Interface
export interface UserActivityStats {
  userId: string;
  projectsContributed: number;
  tasksCompleted: number;
  skillsVerified: number;
  lastActive: Date;
  contributionScore: number;
}

// Client-side API functions that call server endpoints instead of using MongoDB directly

export async function trackActivity(activity: Omit<Activity, "id" | "timestamp">): Promise<void> {
  try {
    const response = await fetch('/api/sync-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activity }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track activity via API');
    }
  } catch (error) {
    console.error("Error tracking activity via API:", error);
    throw error;
  }
}

export async function updateProjectAnalytics(projectId: string, updates: Partial<ProjectAnalytics>): Promise<void> {
  try {
    const response = await fetch('/api/sync-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectAnalytics: { projectId, ...updates } }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update project analytics via API');
    }
  } catch (error) {
    console.error("Error updating project analytics via API:", error);
    throw error;
  }
}

export async function updateUserStats(userId: string, updates: Partial<UserActivityStats>): Promise<void> {
  try {
    const response = await fetch('/api/sync-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userStats: { userId, ...updates } }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user stats via API');
    }
  } catch (error) {
    console.error("Error updating user stats via API:", error);
    throw error;
  }
}

export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
  try {
    const response = await fetch(`/api/project-analytics?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to get project analytics via API');
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting project analytics via API:", error);
    throw error;
  }
}

export async function getUserStats(userId: string): Promise<UserActivityStats | null> {
  try {
    const response = await fetch(`/api/user-stats?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to get user stats via API');
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting user stats via API:", error);
    throw error;
  }
}

export async function getRecentActivities(userId: string, limit: number = 10): Promise<Activity[]> {
  try {
    const response = await fetch(`/api/activities?userId=${userId}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to get recent activities via API');
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting recent activities via API:", error);
    throw error;
  }
}