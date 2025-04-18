export interface Skill {
  id?: string;
  name: string;
  proficiency_level?: number;
  updated_at?: string;
}

export interface SkillResponse {
  data: {
    skills: string[];
  };
  status: number;
}