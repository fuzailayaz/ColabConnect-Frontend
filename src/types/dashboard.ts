import type { Database } from '@/types/database';

// Core Types (extending Supabase types)
export type Project = Database['public']['Tables']['projects']['Row'] & {
  domains?: Domain[];
  team_count?: number;
  task_count?: number;
  domain_icon?: React.ReactNode;
};

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  project?: Pick<Project, 'id' | 'name' | 'description'>;
  assignee?: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>;
};

export type Domain = Database['public']['Tables']['domains']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'] & {
  members?: Profile[];
  projects?: Project[];
  domains?: Domain[];
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  roomName: string;
};

export type Activity = {
  id: string;
  type: 'task_completed' | 'member_added' | 'comment_added' | 'project_created';
  userId: string;
  target: string;
  timestamp: string;
  projectId?: string | null;
};

// Component Props
export interface ActivityFeedProps {
  activities?: Activity[];
}

export interface TrendingSkillsProps {
  skills: Database['public']['Tables']['skill_trends']['Row'][];
  onSkillClick?: (skill: string) => void;
}

export interface RecommendedCollaboratorsProps {
  collaborators: (Profile & { match_score: number })[];
  onConnect?: (collaboratorId: string) => void;
}

export interface DashboardStats {
  projectsCount: number;
  collaboratorsCount: number;
  tasksCompleted: number;
  skillsCount: number;
}

export interface AIRecommendation {
  type: 'learning' | 'project' | 'skill';
  content: string;
  confidence: number;
  actionUrl?: string;
}

// Utility Types
export type WithLoadingState<T> = T & {
  isLoading?: boolean;
  error?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};