'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  currentPath: string;
  previousPath: string;
  isNavigating: boolean;
  setCurrentPath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: '',
  previousPath: '',
  isNavigating: false,
  setCurrentPath: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''; // Provide a default value when pathname is null
  const [currentPath, setCurrentPath] = useState(pathname);
  const [previousPath, setPreviousPath] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (pathname !== currentPath) {
      setPreviousPath(currentPath);
      setCurrentPath(pathname);
      setIsNavigating(true);
      
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{
        currentPath,
        previousPath,
        isNavigating,
        setCurrentPath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);