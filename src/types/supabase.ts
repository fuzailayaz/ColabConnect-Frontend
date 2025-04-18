import { Database } from '@/types/database';

export type Project = Database['public']['Tables']['projects']['Row'] & {
  domains: Database['public']['Tables']['domains']['Row'][];
  team_count?: number;
};

export type AIAlert = Database['public']['Tables']['ai_alerts']['Row'];