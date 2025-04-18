import { NextResponse } from 'next/server';
import { syncUserToMongo } from '@/utils/mongodb.server';
import { Database } from '@/types/database';

// Mark this file as a server component
export const runtime = 'nodejs';

type UserData = {
  id: string;
  email: string;
  profile: Database['public']['Tables']['profiles']['Row'];
};

export async function POST(request: Request) {
  try {
    const data: UserData = await request.json();
    
    if (!data.id || !data.email) {
      return NextResponse.json({ error: 'Invalid user data: ID and email are required' }, { status: 400 });
    }

    try {
      await syncUserToMongo({
        id: data.id,
        email: data.email,
        profile: data.profile
      });
      return NextResponse.json({ success: true });
    } catch (syncError: any) {
      console.error('Error syncing user to MongoDB:', syncError);
      return NextResponse.json(
        { error: syncError.message || 'Failed to sync user to MongoDB' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}