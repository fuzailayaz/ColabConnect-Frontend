import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface AIRequestOptions {
  prompt: string;
  context?: {
    skills?: string[];
    interests?: string[];
    projects?: any[];
    role?: string;
  };
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  type?: 'success' | 'error';
  metadata?: any;
  timestamp?: string;
  category?: string;
}

export async function generateAIResponse({ prompt, context, maxTokens = 500 }: AIRequestOptions): Promise<AIResponse> {
  try {
    // Build system message based on context
    let systemMessage = "You are an AI assistant for CollabConnect, a platform for collaboration and skill development.";
    if (context) {
      if (context.skills?.length) {
        systemMessage += ` The user has skills in: ${context.skills.join(', ')}.`;
      }
      if (context.interests?.length) {
        systemMessage += ` Their interests include: ${context.interests.join(', ')}.`;
      }
      if (context.role) {
        systemMessage += ` They are a ${context.role}.`;
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    return {
      content: response.choices[0]?.message?.content || "I couldn't generate a response.",
      type: 'success',
      metadata: {
        usage: response.usage,
        model: response.model,
      }
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return {
      content: "Sorry, I encountered an error while processing your request.",
      type: 'error',
      metadata: { error: error.message }
    };
  }
}

export async function generateProjectRecommendations(skills: string[]): Promise<AIResponse> {
  const prompt = `Based on skills in ${skills.join(', ')}, suggest 3 project ideas. Format as JSON: { "projects": [{ "title": "", "description": "", "requiredSkills": [], "difficulty": "easy|medium|hard" }] }`;
  return generateAIResponse({ prompt, context: { skills } });
}

export async function generateLearningPath(currentSkills: string[], targetSkill: string): Promise<AIResponse> {
  const prompt = `Create a learning path to master ${targetSkill} given current skills: ${currentSkills.join(', ')}. Format as JSON: { "steps": [{ "title": "", "description": "", "resources": [], "timeEstimate": "" }] }`;
  return generateAIResponse({ prompt, context: { skills: currentSkills } });
}

export async function analyzeSkillGaps(userSkills: string[], marketDemand: string[]): Promise<AIResponse> {
  const prompt = `Compare user skills (${userSkills.join(', ')}) with market demand (${marketDemand.join(', ')}). Identify gaps and suggest improvements. Format as JSON: { "gaps": [], "recommendations": [], "priority": "high|medium|low" }`;
  return generateAIResponse({ prompt, context: { skills: userSkills } });
}

export async function suggestCollaborators(projectDescription: string, requiredSkills: string[]): Promise<AIResponse> {
  const prompt = `For a project: "${projectDescription}" needing skills in ${requiredSkills.join(', ')}, suggest ideal team composition. Format as JSON: { "roles": [{ "title": "", "requiredSkills": [], "responsibility": "" }] }`;
  return generateAIResponse({ prompt, context: { skills: requiredSkills } });
}
