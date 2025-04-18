import { NextResponse } from 'next/server';
import supabase from '@/utils/supabase';
import { AIResponse } from '@/lib/ai';

// Mock AI responses for different types of queries
const mockResponses: Record<string, string[]> = {
  project: [
    "I recommend breaking down your project into smaller, manageable tasks using the task manager.",
    "Consider using the collaboration features to invite team members with complementary skills.",
    "Based on your project description, you might want to explore the React component library in the resources section."
  ],
  error: [
    "This error typically occurs when there's a mismatch between your API request and response structure. Try checking the data types.",
    "I've analyzed your error and it seems to be related to asynchronous code execution. Consider using async/await or promises.",
    "This looks like a state management issue. Make sure you're not mutating state directly in React components."
  ],
  feature: [
    "That feature could be implemented using the WebSocket API for real-time updates.",
    "For that feature, I recommend using a state management library like Redux or Context API.",
    "This feature would benefit from implementing a custom hook to encapsulate the logic."
  ],
  general: [
    "I'm here to help with your development questions and project management needs.",
    "You can ask me about code issues, project planning, or collaboration strategies.",
    "I can provide guidance on best practices for web development and project organization."
  ]
};

// Function to determine the category of a message
function categorizeMessage(message: string): string {
  message = message.toLowerCase();
  
  if (message.includes('project') || message.includes('plan') || message.includes('timeline')) {
    return 'project';
  } else if (message.includes('error') || message.includes('bug') || message.includes('fix')) {
    return 'error';
  } else if (message.includes('feature') || message.includes('implement') || message.includes('add')) {
    return 'feature';
  } else {
    return 'general';
  }
}

// Function to generate a response based on the message
function generateAIResponse(message: string): AIResponse {
  const category = categorizeMessage(message);
  const responses = mockResponses[category];
  const randomIndex = Math.floor(Math.random() * responses.length);
  
  return {
    content: responses[randomIndex],
    timestamp: new Date().toISOString(),
    category: category
  };
}

export async function POST(request: Request) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate AI response
    const aiResponse = generateAIResponse(message);

    // Store the conversation in Supabase
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        },
        {
          user_id: userId,
          role: 'assistant',
          content: aiResponse.content,
          created_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error storing conversation:', insertError);
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}