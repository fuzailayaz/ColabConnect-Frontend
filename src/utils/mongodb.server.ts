import 'server-only';
import { MongoClient, Db } from "mongodb";
import { Database } from "@/types/database";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'CollabConnect');
}

type UserData = {
  id: string;
  email: string;
  profile: Database['public']['Tables']['profiles']['Row'];
};

export async function syncUserToMongo(userData: UserData): Promise<void> {
  if (!userData) {
    throw new Error('User data is required');
  }
  if (!userData.id || !userData.email) {
    throw new Error(`Invalid user data: ID and email are required. Received: id=${userData.id}, email=${userData.email}`);
  }

  try {
    const db = await connectToDB().catch(error => {
      console.error('MongoDB connection error:', error);
      throw new Error('Failed to connect to MongoDB: ' + error.message);
    });

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ id: userData.id });

    if (existingUser) {
      // Update existing user
      await db.collection('users').updateOne(
        { id: userData.id },
        { $set: {
            email: userData.email,
            profile: userData.profile,
            lastUpdated: new Date()
          }
        }
      );
    } else {
      // Create new user
      await db.collection('users').insertOne({
        id: userData.id,
        email: userData.email,
        profile: userData.profile,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error);
    throw error;
  }
}

export default clientPromise;
