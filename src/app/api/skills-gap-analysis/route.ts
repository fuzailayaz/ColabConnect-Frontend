import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  try {
    // Get user skills
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile?.skills || profile.skills.length === 0) {
      return NextResponse.json(
        { skills: [], recommendedCourses: [] },
        { status: 200 }
      )
    }

    // Get market demand for these skills
    const { data: marketData, error: marketError } = await supabase
      .from('market_demand')
      .select('skill_name, demand_level')
      .in('skill_name', profile.skills)

    if (marketError) throw marketError

    // Get learning resources
    const { data: courses, error: coursesError } = await supabase
      .from('learning_resources')
      .select('*')
      .in('skill_name', profile.skills)
      .order('rating', { ascending: false })
      .limit(3)

    if (coursesError) throw coursesError

    // Format response
    const skills = profile.skills.map((skill: any) => {
      const marketInfo = marketData?.find(m => m.skill_name === skill)
      return {
        name: skill,
        level: Math.floor(Math.random() * 50) + 30, // Mock user level
        demand: marketInfo?.demand_level || 50, // Default to 50 if no data
        gap: marketInfo ? Math.max(0, marketInfo.demand_level - 30) : 20 // Mock gap calculation
      }
    }).sort((a: { gap: number }, b: { gap: number }) => b.gap - a.gap)

    return NextResponse.json(
      { skills, recommendedCourses: courses || [] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in skill gap analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze skill gaps' },
      { status: 500 }
    )
  }
}