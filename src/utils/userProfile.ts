import { MongoClient, Collection } from 'mongodb';
import mongoClientPromise from './mongodb.server';

// utils/userProfile.ts

export interface UserProfile {
  id?: string;
  email: string | null;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  location?: string;
  timeZone?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  website?: string;
  role?: string;
  interests?: string[];
  experienceLevel?: string;
  availability?: string;
  tasksCompleted?: number;
  projectsCompleted?: number;
  teamCollaborations?: number;
}


export async function getUserProfile(): Promise<Collection<UserProfile>> {
  try {
    const client = await mongoClientPromise;
    const db = client.db('CollabConnect');
    return db.collection<UserProfile>('users');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
  try {
    const collection = await getUserProfile();
    const result = await collection.updateOne(
      { userId },
      { 
        $set: {
          ...profileData,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
    return result.acknowledged;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return false;
  }
}