import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Chat from './pages/Chat';
import { authService } from './services';
import type { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    const result = await authService.loginWithWallet();
    if (result.success) {
      setCurrentUser(result.user || null);
    } else {
      console.error(result.error);
    }
  };

  const handleAnonymousLogin = async (username: string) => {
    const result = await authService.loginAnonymous(username);
    if (result.success) {
      setCurrentUser(result.user || null);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <>
      <Chat 
        currentUser={currentUser} 
        onLogin={handleLogin} 
        onAnonymousLogin={handleAnonymousLogin}
        onLogout={handleLogout}
      />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
