'use client';

import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Send, User, Loader, Brain } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { AIMessage } from '@/types/ai';
import { toast } from 'react-hot-toast';
import supabase from '@/utils/supabase';

export default function AIAssistantPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { generateResponse, isLoading, lastResponse, error } = useAI();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;

        // Fetch user's projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        // Fetch user's skills
        const { data: skills, error: skillsError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id);

        if (skillsError) throw skillsError;

        // Set AI context
        const context = {
          projects: projects || [],
          skills: skills || [],
          user: user
        };

        // Update AI context
        await generateResponse(JSON.stringify(context));
      } catch (err) {
        console.error('Error fetching AI context:', err);
        toast.error('Failed to load AI context');
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (lastResponse && !isLoading) {
      const newMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: lastResponse.content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, [lastResponse, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      await generateResponse(newMessage.content);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to get AI response');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto p-6">
      <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ color: theme.text }}>
            <Brain className="h-6 w-6" style={{ color: theme.primary }} />
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-primary' : ''
                    }`}
                    style={{
                      backgroundColor: message.role === 'user' ? theme.primary : `${theme.primary}20`,
                      color: message.role === 'user' ? theme.card : theme.primary
                    }}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                    }`}
                    style={{
                      backgroundColor: message.role === 'user' ? `${theme.primary}20` : theme.background,
                      color: theme.text,
                      border: message.role === 'assistant' ? `1px solid ${theme.border}` : 'none'
                    }}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: `${theme.text}99` }}
                    >
                      {formatTimestamp(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Brain className="h-4 w-4" style={{ color: theme.primary }} />
                  </div>
                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
                  >
                    <Loader className="w-4 h-4 animate-spin" style={{ color: theme.primary }} />
                    <span className="text-sm" style={{ color: theme.text }}>
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1"
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text
                }}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  backgroundColor: theme.primary,
                  color: theme.card,
                  opacity: !input.trim() || isLoading ? 0.5 : 1
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}