import React from 'react';
import { MainLayout } from '../components/layout/main-layout-mvp';
import type { User } from '../types';

interface ChatPageProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout?: () => void;
}

export default function Chat({ currentUser, onLogin, onLogout }: ChatPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <MainLayout 
        currentUser={currentUser} 
        onLogin={onLogin}
        onLogout={onLogout}
      />
    </div>
  );
}
