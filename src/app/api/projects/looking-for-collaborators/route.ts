import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        required_skills,
        owner_id:profiles(id, full_name, avatar_url),
        status,
        visibility
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}