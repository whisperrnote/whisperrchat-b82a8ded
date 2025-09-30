import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Chat from './pages/Chat';
import { authService } from './services';
import { AuthModal } from './components/auth/auth-modal';
import type { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);

  const handleLoginRequest = () => {
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <>
      <Chat 
        currentUser={currentUser} 
        onLogin={handleLoginRequest}
        onLogout={handleLogout}
      />
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
