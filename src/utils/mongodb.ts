// Client-safe MongoDB utility file
// This file doesn't import MongoDB directly to avoid client-side errors
// For actual MongoDB operations, use the server-side API routes

import { Database } from "@/types/database";
import { Activity, ProjectAnalytics, UserStats } from "@/types/activity";

export interface SyncUserRequest {
  id: string;
  email: string;
  profile: Database['public']['Tables']['profiles']['Row'];
}

// Client-side API functions
export async function syncUserToMongo(userData: SyncUserRequest): Promise<void> {
  try {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user to MongoDB');
    }
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error);
    throw error;
  }
}

// Client-safe function to connect to the database via API
export async function connectToDB(): Promise<any> {
  try {
    const response = await fetch('/api/test-mongo');
    if (!response.ok) {
      throw new Error('Failed to connect to database via API');
    }
    return await response.json();
  } catch (error) {
    console.error('Error connecting to database via API:', error);
    throw error;
  }
}

// Export a dummy client promise to maintain API compatibility with existing code
const dummyClientPromise = Promise.resolve({} as any);
export default dummyClientPromise;
