import 'server-only';
import { NextResponse } from "next/server";
import { connectToMongoDB } from '@/lib/mongodb';

// Mark this file as a server component
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { activity } = await request.json();

    if (!activity) {
      return NextResponse.json(
        { error: "Activity data is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToMongoDB();
    const collection = db.collection('activities');

    // Add ID and timestamp if not already present
    const activityWithMetadata = {
      ...activity,
      id: activity.id || Date.now().toString(),
      timestamp: activity.timestamp || new Date(),
    };

    await collection.insertOne(activityWithMetadata);

    return NextResponse.json(
      { success: true, activity: activityWithMetadata },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing activity:", error);
    return NextResponse.json(
      { error: "Failed to sync activity" },
      { status: 500 }
    );
  }

}