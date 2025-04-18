export type Database = {
  public: {
    Tables: {
      skill_trends: {
        Row: {
          id: number;
          name: string;
          collaborator_count: number;
          growth_percentage: number;
          demand_score: number;
        };
        Insert: {
          id?: number;
          name: string;
          collaborator_count?: number;
          growth_percentage?: number;
          demand_score?: number;
        };
        Update: {
          id?: number;
          name?: string;
          collaborator_count?: number;
          growth_percentage?: number;
          demand_score?: number;
        };
      };

      project_requests: {
  Row: {
    id: number;
    project_id: string;
    user_id: string;
    status: "active" | "inactive" | "pending" | "rejected";
    request_message: string | null; 
    created_at: string;
  };
  Insert: {
    id?: number;
    project_id: string;
    user_id: string;
    status: "active" | "inactive" | "pending" | "rejected";
    request_message?: string | null; 
    created_at?: string;
  };
  Update: {
    id?: number;
    project_id?: string;
    user_id?: string;
    status: "active" | "inactive" | "pending" | "rejected";
    request_message?: string | null; 
    created_at?: string;
  };
};


      project_trends: {
        Row: {
          id: number;
          name: string;
          active_count: number;
        };
        Insert: {
          id?: number;
          name: string;
          active_count?: number;
        };
        Update: {
          id?: number;
          name?: string;
          active_count?: number;
        };
      };
      global_activity: {
        Row: {
          id: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          description?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          owner_id: string;
          status: 'planning' | 'active' | 'completed' | 'on_hold';
          visibility: 'public' | 'private' | 'team_only';
          tech_stack: string[];
          required_skills: string[];
          team_size: number;
          deadline: string | null;
          github_url: string | null;
          project_type: 'academic' | 'personal' | 'startup' | 'research';
          engagement_score: number;
          domain_id: string;
          team_id: string;
          engineering_domain: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          owner_id: string;
          status?: 'planning' | 'active' | 'completed' | 'on_hold';
          visibility?: 'public' | 'private' | 'team_only';
          tech_stack?: string[];
          required_skills?: string[];
          team_size?: number;
          deadline?: string | null;
          github_url?: string | null;
          project_type?: 'academic' | 'personal' | 'startup' | 'research';
          engagement_score?: number;
          domain_id: string;
          team_id: string;
          engineering_domain: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          owner_id?: string;
          status?: 'planning' | 'active' | 'completed' | 'on_hold';
          visibility?: 'public' | 'private' | 'team_only';
          tech_stack?: string[];
          required_skills?: string[];
          team_size?: number;
          deadline?: string | null;
          github_url?: string | null;
          project_type?: 'academic' | 'personal' | 'startup' | 'research';
          engagement_score?: number;
          domain_id?: string;
          team_id?: string;
          engineering_domain?: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
      };
      notifications: {
        Row: {
          [x: string]: any;
          id: string;
          user_id: string;
          type: 'message' | 'team' | 'task' | 'system';
          title: string;
          description: string;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'message' | 'team' | 'task' | 'system';
          title: string;
          description: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'message' | 'team' | 'task' | 'system';
          title?: string;
          description?: string;
          created_at?: string;
          is_read?: boolean;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'contributor';
          joined_at: string;
          status: 'active' | 'inactive' | 'pending';
          team_id: string;
          project_id?: string;
          request_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'contributor';
          joined_at?: string;
          status?: 'active' | 'inactive' | 'pending';
          team_id: string;
          project_id?: string;
          request_message: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member' | 'contributor';
          joined_at?: string;
          status?: 'active' | 'inactive' | 'pending';
          team_id?: string;
          project_id?: string;
          request_message: string | null;
        };
      };

      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
      };
      user_skills: {
        Row: {
          user_id: string;
          skill_id: string;
          proficiency_level: number;
          verified: boolean;
        };
        Insert: {
          user_id: string;
          skill_id: string;
          proficiency_level: number;
          verified?: boolean;
        };
        Update: {
          user_id?: string;
          skill_id?: string;
          proficiency_level?: number;
          verified?: boolean;
        };
      };
      project_updates: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          update_type: 'milestone' | 'progress' | 'announcement' | 'issue';
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          update_type: 'milestone' | 'progress' | 'announcement' | 'issue';
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          update_type?: 'milestone' | 'progress' | 'announcement' | 'issue';
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
          priority: 'LOW' | 'MEDIUM' | 'HIGH';
          assignee_id: string | null;
          project_id: string;
          due_date: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          assignee_id?: string | null;
          project_id: string;
          due_date?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          assignee_id?: string | null;
          project_id?: string;
          due_date?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          tasks_completed: null;
          projects_completed: null;
          team_collaborations: null;
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          github_username: string | null;
          linkedin_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
          role: string | null;
          skills: string[];
          interests: string[];
          experience_level: string | null;
          availability: boolean;
          time_zone: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
          role?: string | null;
          skills?: string[];
          interests?: string[];
          experience_level?: string | null;
          availability?: boolean;
          time_zone?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
          role?: string | null;
          skills?: string[];
          interests?: string[];
          experience_level?: string | null;
          availability?: boolean;
          time_zone?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          owner_id: string;
          domain_id: string;
          avatar_url: string | null;
          status: 'active' | 'archived';
          github_url: string | null;
          slack_url: string | null;
          engineering_domain: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          owner_id: string;
          domain_id: string;
          avatar_url?: string | null;
          status?: 'active' | 'archived';
          github_url?: string | null;
          slack_url?: string | null;
          engineering_domain: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          owner_id?: string;
          domain_id?: string;
          avatar_url?: string | null;
          status?: 'active' | 'archived';
          github_url?: string | null;
          slack_url?: string | null;
          engineering_domain?: 'biotechnology' | 'computer' | 'mechanical' | 'electrical';
        };
      };
      domains: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      ai_alerts: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          priority: 'low' | 'medium' | 'high';
          resolved: boolean;
          created_at: string;
          related_project: string | null;
          alert_type: 'deadline' | 'resource' | 'collaboration' | 'skill_gap';
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          priority?: 'low' | 'medium' | 'high';
          resolved?: boolean;
          created_at?: string;
          related_project?: string | null;
          alert_type: 'deadline' | 'resource' | 'collaboration' | 'skill_gap';
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          priority?: 'low' | 'medium' | 'high';
          resolved?: boolean;
          created_at?: string;
          related_project?: string | null;
          alert_type?: 'deadline' | 'resource' | 'collaboration' | 'skill_gap';
        };
      };
    },
    Views: {
      [_ in never]: never;
    },
    Functions: {
      get_team_projects: {
        Args: { team_id: string };
        Returns: Database['public']['Tables']['projects']['Row'][];
      };
      get_ai_recommendations: {
        Args: { user_id: string };
        Returns: Database['public']['Tables']['ai_alerts']['Row'][];
      };
      is_project_member: {
        Args: { project_id: string };
        Returns: boolean;
      },
    },
    Enums: {
      engineering_domain: ['biotechnology', 'computer', 'mechanical', 'electrical'];
      alert_priority: ['low', 'medium', 'high'];
      alert_type: ['deadline', 'resource', 'collaboration', 'skill_gap'];
    },
  },
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type ProfileWithSkills = Database['public']['Tables']['profiles']['Row'] & {
  skills: string[];
};