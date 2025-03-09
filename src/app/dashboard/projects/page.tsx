'use client';
import { useAuth } from '@/contexts/AuthContext';
import ProjectCard from '@/components/projects/ProjectCard';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleProjectAction = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    // Handle project creation/joining
  };

  return (
    <div>
      <h1>Projects</h1>
      {/* Project listing */}
      <button onClick={handleProjectAction}>
        Create New Project
      </button>
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
