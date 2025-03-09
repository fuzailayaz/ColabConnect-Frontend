import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { supabase } from '@/lib/supabase';
import apiInstance from '@/utils/api';
import { Project } from '@/types/dashboard';
const apiClient: AxiosInstance = apiInstance;

export const projectService = {
  getProjects: () => api.get<Project[]>('/projects/'),
  getProject: (id: number) => api.get<Project>(`/projects/${id}/`),
  createProject: (data: Partial<Project>) => api.post('/projects/', data),
  updateProject: (id: number, data: Partial<Project>) => api.put(`/projects/${id}/`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}/`),
};


// Update API_BASE_URL to match your Django endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject Supabase token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Error Handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data;
    if (serverError) {
      return {
        message: serverError.message || 'An error occurred',
        errors: serverError.errors || {},
        status: error.response?.status,
      };
    }
  }
  return {
    message: 'Network error occurred',
    errors: {},
    status: 500,
  };
};

// API Functions for Authentication
const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await api.post('/api/token/', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (credentials: { email: string; username: string; password: string }): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await api.post('/api/auth/registration/', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async (): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await api.get('/api/users/profile/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// API Functions for Projects
const projectAPI = {
  getProjects: async () => {
    try {
      const response = await api.get('/api/projects/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getProjectById: async (id: number) => {
    try {
      const response = await api.get(`/api/projects/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createProject: async (projectData: any) => {
    try {
      const response = await api.post('/api/projects/', projectData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// API Functions for Tasks
const taskAPI = {
  getTasks: async () => {
    try {
      const response = await api.get('/api/tasks/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createTask: async (taskData: any) => {
    try {
      const response = await api.post('/api/tasks/', taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// API Functions for Teams
const teamAPI = {
  getTeams: async () => {
    try {
      const response = await api.get('/api/teams/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createTeam: async (teamData: any) => {
    try {
      const response = await api.post('/api/teams/', teamData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateTeam: async (id: number, teamData: any) => {
    try {
      const response = await api.put(`/api/teams/${id}/`, teamData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// API Functions for Messages
const messageAPI = {
  getMessages: async (roomName: string) => {
    try {
      const response = await api.get(`/api/messages/${roomName}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  sendMessage: async (messageData: any) => {
    try {
      const response = await api.post('/api/messages/', messageData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Exporting APIs
export {
  authAPI,
  projectAPI,
  taskAPI,
  teamAPI,
  messageAPI,
  api, // Ensure api is exported here if you want to use it as a named export
};

export default api;
