'use client';

import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  type: 'project' | 'team' | 'task';
  title: string;
  description: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchItems = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce(searchItems, 300);

  useEffect(() => {
    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  return { query, setQuery, results, isLoading };
}