import React from 'react';
import { MainLayout } from '../components/layout/main-layout';

export default function Chat() {
  return (
    <div className="min-h-screen bg-background">
      <MainLayout currentUser={null} />
    </div>
  );
}