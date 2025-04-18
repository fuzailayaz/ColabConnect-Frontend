'use client';

import { useState, useEffect } from 'react';
import { Brain, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIRecommendation } from '@/types/ai';
import { generateProjectRecommendations, generateLearningPath, analyzeSkillGaps } from '@/lib/ai';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // Try to get user safely
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (e) {
    console.error('Error accessing auth context:', e);
    setError('Unable to access user information');
  }

  useEffect(() => {
    // Add a small delay to ensure auth context is fully loaded
    const timer = setTimeout(() => {
      if (user?.id) {
        fetchRecommendations();
      } else {
        // If no user is found after delay, show mock recommendations
        setRecommendations(getMockRecommendations());
        setIsLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Generate mock recommendations for development/testing
  const getMockRecommendations = () => {
    return [
      {
        type: 'learning',
        content: 'Learn React Server Components',
        metadata: {
          confidence: 0.92,
          description: 'Based on your Next.js projects, you might benefit from learning about React Server Components',
          url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components'
        }
      },
      {
        type: 'learning',
        content: 'Explore TypeScript Advanced Types',
        metadata: {
          confidence: 0.85,
          description: 'Your TypeScript usage could be enhanced with knowledge of advanced type features',
          url: 'https://www.typescriptlang.org/docs/handbook/advanced-types.html'
        }
      },
      {
        type: 'project',
        content: 'Collaborate on AI Integration Projects',
        metadata: {
          confidence: 0.78,
          description: 'Your skills match well with current AI integration projects in the community',
          url: '/dashboard/projects/discover'
        }
      }
    ] as AIRecommendation[];
  };

  const fetchRecommendations = async () => {
    if (!user?.id) {
      setRecommendations(getMockRecommendations());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if OpenAI API key is available
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        setError('AI features are currently unavailable');
        return;
      }

      // Fetch user's skills and interests from Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('skills, interests')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Unable to load recommendations');
        return;
      }

      // Get project recommendations
      try {
        const projectRecs = await generateProjectRecommendations(userData.skills || []);
        const learningRecs = await generateLearningPath(userData.skills || [], 'machine_learning');
        const gapAnalysis = await analyzeSkillGaps(userData.skills || [], ['react', 'node', 'python']);

        setRecommendations([
          {
            type: 'project',
            content: projectRecs.content,
            metadata: projectRecs.metadata
          },
          {
            type: 'learning',
            content: learningRecs.content,
            metadata: learningRecs.metadata
          },
          {
            type: 'skill_gap',
            content: gapAnalysis.content,
            metadata: gapAnalysis.metadata
          }
        ]);
      } catch (aiError) {
        console.error('Error generating AI recommendations:', aiError);
        setError('Unable to generate AI recommendations');
      }
    } catch (error) {
      console.error('Error in recommendations:', error);
      setError('Unable to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: theme.card, color: theme.text }}>
        <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
        <p className="text-sm opacity-70">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: theme.card, color: theme.text }}>
        <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: theme.card }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 mr-2" style={{ color: theme.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
            AI Recommendations
          </h2>
        </div>
        <button 
          onClick={fetchRecommendations}
          className="p-2 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: theme.hover }}
        >
          <ArrowRight className="h-4 w-4" style={{ color: theme.text }} />
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div 
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
        >
          <p style={{ color: theme.text }}>No recommendations available at this time.</p>
          <p className="text-sm mt-2 opacity-70" style={{ color: theme.text }}>Check back later for personalized suggestions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg transition-all duration-200 hover:translate-x-1"
              style={{ 
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium" style={{ color: theme.text }}>
                  {rec.type === 'project' ? 'Recommended Projects' : rec.type === 'learning' ? 'Learning Path' : 'Skill Gap Analysis'}
                </h3>
              <span 
                className="text-sm px-2 py-1 rounded"
                style={{ 
                  backgroundColor: theme.primary + '20',
                  color: theme.primary
                }}
              >
                {Math.round(rec.metadata.confidence * 100)}% match
              </span>
            </div>
            <p 
              className="text-sm"
              style={{ color: theme.text + '99' }}
            >
              {rec.content}
            </p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default AIRecommendations;
