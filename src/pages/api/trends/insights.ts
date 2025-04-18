import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-client';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw trends data from Supabase
    const { data: skills, error: skillsError } = await supabase
      .from('skill_trends')
      .select('*')
      .order('demand_score', { ascending: false })
      .limit(10);
    
    if (skillsError) throw skillsError;

    const { data: projects, error: projectsError } = await supabase
      .from('project_trends')
      .select('*')
      .order('active_count', { ascending: false })
      .limit(10);
    
    if (projectsError) throw projectsError;

    const { data: activity, error: activityError } = await supabase
      .from('global_activity')
      .select('*')
      .single();
    
    if (activityError && activityError.code !== 'PGRST116') throw activityError;

    // Format data for AI processing
    const trendsData = {
      skills: skills || [],
      projects: projects || [],
      activity: activity || { description: 'No activity data available' }
    };

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes tech industry trends and provides insights for developers."
        },
        {
          role: "user",
          content: `Analyze these tech industry trends and provide 3-5 concise, actionable insights for developers:\n${JSON.stringify(trendsData, null, 2)}`
        }
      ],
      max_tokens: 500,
    });

    const insights = completion.choices[0]?.message?.content || "No insights available at this time.";

    // Return both raw data and AI-generated insights
    return res.status(200).json({
      data: trendsData,
      insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}