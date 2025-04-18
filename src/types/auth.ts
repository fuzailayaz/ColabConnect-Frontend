// types/auth.ts
export interface AuthUser {
  id: string;
  email: string | undefined;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  skills: string[];
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}