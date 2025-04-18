import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection details
const MONGO_DB_URI = process.env.MONGO_DB_URI!;
const MONGO_DB_NAME = 'CollabConnect';

// MongoDB Client (server-side only)
let mongoClient: MongoClient | null = null;
let db: any = null;

async function connectToMongoDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_DB_URI);
    await mongoClient.connect();
    db = mongoClient.db(MONGO_DB_NAME);
    console.log(`✅ Connected to MongoDB: ${MONGO_DB_NAME}`);
  }
  return { mongoClient, db };
}

// Mock projects data for fallback
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    name: 'AI-Powered Task Manager',
    description: 'A smart task management system that uses AI to prioritize and suggest tasks.',
    skillsNeeded: ['React', 'TypeScript', 'AI/ML', 'Node.js'],
    required_skills: ['React', 'TypeScript', 'AI/ML', 'Node.js'],
    status: 'active'
  },
  {
    id: 'mock-2',
    name: 'Collaborative Code Editor',
    description: 'Real-time collaborative code editor with syntax highlighting and version control.',
    skillsNeeded: ['WebSockets', 'React', 'Express', 'MongoDB'],
    required_skills: ['WebSockets', 'React', 'Express', 'MongoDB'],
    status: 'planning'
  },
  {
    id: 'mock-3',
    name: 'AR Learning Platform',
    description: 'Augmented reality platform for interactive educational content.',
    skillsNeeded: ['AR/VR', 'Unity', 'Mobile Development', 'UX Design'],
    required_skills: ['AR/VR', 'Unity', 'Mobile Development', 'UX Design'],
    status: 'active'
  }
];

// GET handler for projects
export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!MONGO_DB_URI) {
      console.log('MongoDB URI not found, returning mock data');
      return NextResponse.json(MOCK_PROJECTS);
    }
    
    const { db } = await connectToMongoDB();
    const projects = await db.collection('projects').find({}).toArray();
    
    // If no projects are found, return mock data instead of empty array
    if (!projects || projects.length === 0) {
      console.log('No projects found in MongoDB, returning mock data');
      return NextResponse.json(MOCK_PROJECTS);
    }
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return mock data on error to provide a better user experience
    console.log('Error connecting to MongoDB, returning mock data');
    return NextResponse.json(MOCK_PROJECTS, { status: 200 });
  }
}

// POST handler for syncing a project
export async function POST(request: Request) {
  try {
    const { type, record } = await request.json();
    const { db } = await connectToMongoDB();
    const collection = db.collection('projects');

    if (type === 'INSERT') {
      await collection.insertOne(record);
    } else if (type === 'UPDATE') {
      await collection.updateOne({ id: record.id }, { $set: record });
    } else if (type === 'DELETE') {
      await collection.deleteOne({ id: record.id });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing project:', error);
    return NextResponse.json(
      { error: 'Failed to sync project' },
      { status: 500 }
    );
  }
}
