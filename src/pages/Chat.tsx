import React, { useState } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import type { User } from '../types';

const GUEST_USER: User = {
  id: 'guest',
  username: 'guest',
  displayName: 'Guest',
  identity: {
    id: 'guest',
    publicKey: '',
    identityKey: '',
    signedPreKey: '',
    oneTimePreKeys: [],
  },
  createdAt: new Date(),
  lastSeen: new Date(),
};

export default function Chat() {
  const [currentUser] = useState<User>(GUEST_USER);

  const handleLogout = () => {
    // Handle logout logic
  };

  return (
    <div className="min-h-screen bg-background">
      <MainLayout currentUser={currentUser} onLogout={handleLogout} />
    </div>
  );
}