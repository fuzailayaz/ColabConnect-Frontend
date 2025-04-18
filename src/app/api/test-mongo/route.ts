import { connectToDB } from '@/utils/mongodb.server';
import { NextResponse } from 'next/server';

// Mark this file as a server component
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await connectToDB(); // ✅ Use connectToDB, not connectToMongoDB
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      message: 'Connected to CollabConnect successfully',
      collections: collections.map((c: { name: string }) => c.name), // ✅ Explicitly define type
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
