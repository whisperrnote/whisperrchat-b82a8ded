import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/auth-form';

export default function Auth() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthForm onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}