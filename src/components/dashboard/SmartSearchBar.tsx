'use client';

import { useState, useEffect } from 'react';
import { Search, Mic, X, Brain } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SuggestionItemProps {
  suggestion: string;
  onClick: () => void;
  theme: any;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, onClick, theme }) => (
  <li 
    onClick={onClick}
    className={`px-4 py-2 cursor-pointer transition-all duration-200 flex items-center hover:bg-opacity-10 hover:bg-primary`}
    style={{ 
      color: theme.text,
      backgroundColor: theme.card
    }}
  >
    <Brain className="h-4 w-4 mr-2 opacity-50" />
    {suggestion}
  </li>
);

const SmartSearchBar = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { generateResponse, isLoading, suggestions: aiSuggestions } = useAI();
  const { theme } = useTheme();

  useEffect(() => {
    if (aiSuggestions?.length > 0) {
      setSuggestions(aiSuggestions);
    }
  }, [aiSuggestions]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      await generateResponse(query);
      setQuery('');
      setSuggestions([]);
    } catch (error) {
      toast.error('Failed to process your request');
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2 && aiSuggestions?.length > 0) {
      const filtered = aiSuggestions.filter(
        suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (SpeechRecognition) {
      setIsListening(true);
      const recognition = new SpeechRecognition();
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        generateResponse(transcript).catch(() => {
          toast.error('Failed to process voice input');
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Failed to recognize speech');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Voice search is not supported in your browser');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          {isLoading ? (
            <Brain className="absolute left-3 h-5 w-5 animate-pulse" style={{ color: theme.primary }} />
          ) : (
            <Search className="absolute left-3 h-5 w-5" style={{ color: theme.text }} />
          )}
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Ask anything or search..."
            className="w-full pl-10 pr-16 py-3 rounded-lg transition-all duration-200"
            style={{ 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
              boxShadow: `0 0 0 1px ${theme.border}`,
            }}
          />
          {query && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="absolute right-12 hover:opacity-80 transition-opacity"
              style={{ color: theme.text }}
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button 
            type="button" 
            onClick={startVoiceSearch}
            className={`absolute right-3 p-1 rounded-full transition-all duration-200 ${
              isListening ? 'animate-pulse' : 'hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: isListening ? `${theme.primary}20` : 'transparent',
              color: isListening ? theme.primary : theme.text
            }}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div 
          className="absolute z-10 w-full mt-1 rounded-md shadow-lg border"
          style={{ 
            backgroundColor: theme.card,
            borderColor: theme.border
          }}
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  setSuggestions([]);
                  generateResponse(suggestion).catch(() => {
                    toast.error('Failed to process suggestion');
                  });
                }}
                theme={theme}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
