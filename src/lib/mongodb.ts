import { MongoClient } from 'mongodb';

// This file should only be imported from server components or API routes
// Add 'use server' directive to ensure this is never used in client components
'use server';

// MongoDB connection details
const MONGO_DB_URI = process.env.MONGO_DB_URI!;
const MONGO_DB_NAME = 'CollabConnect';

// MongoDB Client (server-side only)
let mongoClient: MongoClient | null = null;
let db: any = null;

export async function connectToMongoDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_DB_URI);
    await mongoClient.connect();
    db = mongoClient.db(MONGO_DB_NAME);
    console.log(`✅ Connected to MongoDB: ${MONGO_DB_NAME}`);
  }
  return { mongoClient, db };
}

// Fetch projects from MongoDB
export async function getProjects() {
  const { db } = await connectToMongoDB();
  return db.collection('projects').find({}).toArray();
}

// Insert project into MongoDB (called by Supabase Webhook)
export async function syncProject(type: string, record: any) {
  const { db } = await connectToMongoDB();
  const collection = db.collection('projects');

  if (type === 'INSERT') {
    await collection.insertOne(record);
  } else if (type === 'UPDATE') {
    await collection.updateOne({ id: record.id }, { $set: record });
  } else if (type === 'DELETE') {
    await collection.deleteOne({ id: record.id });
  }
}
