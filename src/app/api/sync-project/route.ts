import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/mongodb.server';
import { createClient } from '@supabase/supabase-js';

// Mark this file as a server component
export const runtime = 'nodejs';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: Request) {
  try {
    const { project, userId } = await request.json();
    
    if (!project || !userId) {
      return NextResponse.json({ error: 'Invalid project data' }, { status: 400 });
    }

    // Verify the user has access to this project in Supabase
    const { data: projectAccess, error: accessError } = await supabaseAdmin
      .from('project_members')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', userId)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const db = await connectToDB();
    const projectsCollection = db.collection('projects');

    const existingProject = await projectsCollection.findOne({ id: project.id });

    if (!existingProject) {
      await projectsCollection.insertOne({
        ...project,
        synced_at: new Date(),
      });
    } else {
      await projectsCollection.updateOne(
        { id: project.id },
        { 
          $set: {
            ...project,
            synced_at: new Date(),
          }
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing project to MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to sync project' },
      { status: 500 }
    );
  }
}