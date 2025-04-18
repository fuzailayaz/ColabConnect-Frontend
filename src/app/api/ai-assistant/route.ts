import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAIResponse } from '@/lib/ai';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get user context from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('skills, interests, projects')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user context' },
        { status: 500 }
      );
    }

    // Generate AI response using our utility
    const response = await generateAIResponse({
      prompt: message,
      context: {
        skills: userData.skills || [],
        interests: userData.interests || [],
        projects: userData.projects || [],
      }
    });

    // Save the interaction to chat history
    const { error: chatError } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          role: 'user',
          content: message
        },
        {
          user_id: userId,
          role: 'assistant',
          content: response.content
        }
      ]);

    if (chatError) {
      console.error('Error saving chat history:', chatError);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing AI assistant request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
