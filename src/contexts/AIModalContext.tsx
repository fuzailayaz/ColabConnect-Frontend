// src/contexts/AIModalContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AIModalContextProps {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AIModalContext = createContext<AIModalContextProps | undefined>(undefined);

export const useAIModal = () => {
  const context = useContext(AIModalContext);
  if (!context) {
    throw new Error('useAIModal must be used within an AIModalProvider');
  }
  return context;
};

interface AIModalProviderProps {
  children: ReactNode;
}

export const AIModalProvider = ({ children }: AIModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const value: AIModalContextProps = {
    isOpen,
    openModal,
    closeModal,
  };

  return (
    <AIModalContext.Provider value={value}>
      {children}
    </AIModalContext.Provider>
  );
};