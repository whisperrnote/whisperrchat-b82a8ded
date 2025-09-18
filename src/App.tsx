// @generated whisperrchat-tool: main-app@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Main WhisperrChat application

import React, { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { MainLayout } from './components/layout/main-layout';
import type { User } from './types';

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

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(GUEST_USER);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app">
      <MainLayout currentUser={currentUser || GUEST_USER} onLogout={handleLogout} />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
