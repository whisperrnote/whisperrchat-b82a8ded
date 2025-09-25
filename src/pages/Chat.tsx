import React from 'react';
import { MainLayout } from '../components/layout/main-layout';
import type { User } from '../types';

interface ChatPageProps {
  currentUser: User | null;
  onLogin: () => void;
}

export default function Chat({ currentUser, onLogin }: ChatPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <MainLayout currentUser={currentUser} onLogin={onLogin} />
    </div>
  );
}