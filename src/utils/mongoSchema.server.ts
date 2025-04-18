import 'server-only';
import { MongoClient, Db } from "mongodb";
import { Activity, ProjectAnalytics, UserStats } from '@/types/activity';
import { connectToDB } from './mongodb.server';

// Track user activity
export const trackActivity = async (activity: Activity) => {
  const db = await connectToDB();
  
  // Add id and timestamp if not present
  if (!activity.id) {
    activity.id = new Date().getTime().toString();
  }
  if (!activity.timestamp) {
    activity.timestamp = new Date();
  }
  
  return db.collection("activities").insertOne(activity);
};

export const updateProjectAnalyticsSimple = async (projectAnalytics: ProjectAnalytics) => {
  const db = await connectToDB();
  
  return db.collection("project_analytics").updateOne(
    { projectId: projectAnalytics.projectId },
    { $set: { ...projectAnalytics, lastUpdated: new Date() } },
    { upsert: true }
  );
};

export const updateUserStatsSimple = async (userStats: UserStats) => {
  const db = await connectToDB();
  
  return db.collection("user_stats").updateOne(
    { userId: userStats.userId },
    { $set: { ...userStats, lastUpdated: new Date() } },
    { upsert: true }
  );
};

// Original function for backward compatibility
export async function trackActivityOld(db: Db, activity: Activity): Promise<void> {
  try {
    const activitiesCollection = db.collection("activities");
    
    // Ensure timestamp is set
    if (!activity.timestamp) {
      activity.timestamp = new Date();
    }
    
    await activitiesCollection.insertOne(activity);
    console.log(`Activity tracked: ${activity.type} by user ${activity.userId}`);
  } catch (error) {
    console.error("Error tracking activity:", error);
    throw error;
  }
}

// Update project analytics
export async function updateProjectAnalytics(
  db: Db, 
  projectId: string, 
  analytics: Partial<ProjectAnalytics>
): Promise<void> {
  try {
    const analyticsCollection = db.collection("project_analytics");
    
    // Check if analytics exist for this project
    const existingAnalytics = await analyticsCollection.findOne({ projectId });
    
    if (existingAnalytics) {
      // Update existing analytics
      await analyticsCollection.updateOne(
        { projectId },
        { $set: { ...analytics, lastUpdated: new Date() } }
      );
    } else {
      // Create new analytics entry
      await analyticsCollection.insertOne({
        projectId,
        ...analytics,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
    
    console.log(`Project analytics updated for project ${projectId}`);
  } catch (error) {
    console.error("Error updating project analytics:", error);
    throw error;
  }
}

// Update user stats
export async function updateUserStats(
  db: Db, 
  userId: string, 
  stats: Partial<UserStats>
): Promise<void> {
  try {
    const userStatsCollection = db.collection("user_stats");
    
    // Check if stats exist for this user
    const existingStats = await userStatsCollection.findOne({ userId });
    
    if (existingStats) {
      // Update existing stats
      await userStatsCollection.updateOne(
        { userId },
        { $set: { ...stats, lastUpdated: new Date() } }
      );
    } else {
      // Create new stats entry
      await userStatsCollection.insertOne({
        userId,
        ...stats,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
    
    console.log(`User stats updated for user ${userId}`);
  } catch (error) {
    console.error("Error updating user stats:", error);
    throw error;
  }
}
