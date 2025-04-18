'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIResponse } from '@/lib/ai';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface AIContextType {
  isLoading: boolean;
  lastResponse: AIResponse | null;
  error: string | null;
  generateResponse: (prompt: string) => Promise<void>;
  clearResponse: () => void;
  suggestions: string[];
  addSuggestion: (suggestion: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const addSuggestion = useCallback((suggestion: string) => {
    setSuggestions(prev => {
      const newSuggestions = [suggestion, ...prev].slice(0, 5); // Keep only the last 5 suggestions
      return [...new Set(newSuggestions)]; // Remove duplicates
    });
  }, []);

  // Use try-catch to handle potential errors with useAuth
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (e) {
    console.error('Error accessing auth context:', e);
  }

  const generateResponse = useCallback(async (prompt: string) => {
    if (!user) {
      setError('You must be logged in to use the AI assistant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/dashboard/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      setLastResponse(data);

      // Add the successful response to suggestions if it's not already there
      if (data.type === 'success' && !suggestions.includes(prompt)) {
        addSuggestion(prompt);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to generate AI response');
    } finally {
      setIsLoading(false);
    }
  }, [user, suggestions, addSuggestion]);

  const clearResponse = useCallback(() => {
    setLastResponse(null);
    setError(null);
  }, []);

  return (
    <AIContext.Provider
      value={{
        isLoading,
        lastResponse,
        error,
        generateResponse,
        clearResponse,
        suggestions,
        addSuggestion,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}
export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
