import React from 'react';
import { MainLayout } from '../components/layout/main-layout';
import type { User } from '../types';

interface ChatPageProps {
  currentUser: User | null;
  onLogin: () => void;
  onAnonymousLogin: (username: string) => Promise<void> | void;
  onLogout?: () => void;
}

export default function Chat({ currentUser, onLogin, onAnonymousLogin, onLogout }: ChatPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <MainLayout 
        currentUser={currentUser} 
        onLogin={onLogin} 
        onAnonymousLogin={onAnonymousLogin}
        onLogout={onLogout}
      />
    </div>
  );
}
