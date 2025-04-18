export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AIRecommendation {
  type: 'project' | 'learning' | 'skill_gap';
  content: string;
  metadata: {
    confidence: number;
    [key: string]: any;
  };
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  requiredSkills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningPathStep {
  title: string;
  description: string;
  resources: string[];
  timeEstimate: string;
}

export interface SkillGapAnalysis {
  gaps: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface TeamComposition {
  roles: {
    title: string;
    requiredSkills: string[];
    responsibility: string;
  }[];
}

export interface AIError {
  message: string;
  code: string;
  details?: any;
}

export interface AIResponse {
  content: string;
  type: 'success' | 'error';
  metadata?: {
    confidence?: number;
    [key: string]: any;
  };
}
