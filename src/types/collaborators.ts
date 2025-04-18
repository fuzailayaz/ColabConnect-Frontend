// src/types/collaborators.ts
import { Database } from './database';

export type Collaborator = Database['public']['Tables']['profiles']['Row'] & {
  match_score: number;
  projects?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
};

export interface RecommendedCollaboratorsProps {
  collaborators?: Collaborator[];
  onConnect?: (collaboratorId: string) => void;
}