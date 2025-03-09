'use client';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Join CollabConnect</h2>
        <p>Sign in or create an account to continue</p>
        <div className="button-group">
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
