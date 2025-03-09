export interface Project {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
    ownerId: number;
  }
  
  export interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    projectId: number;
    assignedTo?: number;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface Team {
    id: number;
    name: string;
    description?: string;
    members: number[]; // Array of user IDs
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface Message {
    id: number;
    senderId: number;
    content: string;
    timestamp: string;
    roomName: string;
  }
  