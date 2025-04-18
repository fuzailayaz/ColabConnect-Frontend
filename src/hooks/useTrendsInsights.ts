import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export default function useTrendsInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trends/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();

    // Set up real-time subscription
    const subscription = supabase
      .channel('trends-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skill_trends'
        },
        () => fetchInsights()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { insights, loading, error, refresh: fetchInsights };
}