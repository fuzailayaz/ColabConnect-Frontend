// src/components/ai/AIModal.tsx
'use client';

import { useAIModal } from "@/contexts/AIModalContext";
import AIAssistantPage from "@/app/dashboard/ai-assistant/page"; // Assumed default export


export const AIModal = () => {
  const { isOpen, closeModal } = useAIModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={closeModal}
        />
        <div className="relative bg-white dark:bg-[#1C1C1E] rounded-lg shadow-xl w-full max-w-4xl mx-4">
          <AIAssistantPage />
        </div>
      </div>
    </div>
  );
};