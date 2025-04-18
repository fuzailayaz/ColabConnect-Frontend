// src/hooks/useMediaQuery.tsx
import { useState, useEffect } from 'react';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;