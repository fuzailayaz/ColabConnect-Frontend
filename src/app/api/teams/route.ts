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
    // First get team memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)

    if (membershipError) throw membershipError
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ teams: [] }, { status: 200 })
    }

    // Then get full team data
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        *,
        domains(*),
        team_members(
          user_id,
          profiles(*)
        )
      `)
      .in('id', memberships.map(m => m.team_id))

    if (teamsError) throw teamsError

    // Format response
    const formattedTeams = teams?.map(team => ({
      ...team,
      members: team.team_members?.map((m: { profiles: any }) => m.profiles)
    })) || []

    return NextResponse.json({ teams: formattedTeams }, { status: 200 })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}