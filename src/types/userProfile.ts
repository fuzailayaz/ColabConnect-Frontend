// src/types/userProfile.ts

export interface ProfileType {
    id: string;
    full_name: string | null; // nullable
    avatar_url: string | null;
    skills: string[] | null;
    role: string | null;
    created_at: string;
    updated_at: string;
    tasks_completed: number | null;
    projects_completed: number | null;
    team_collaborations: number | null;
    bio: string | null;
    // Add other Supabase profile fields as needed
  }
  
  export type UserProfileWithAuth = ProfileType & {
    email: string | null;
  };
  