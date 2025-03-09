export interface User {
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
  
  export interface TopBarProps {
    user: User | null;
    onMenuClick: () => void;
  }