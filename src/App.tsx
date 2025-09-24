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
      // Handle login error
      console.error(result.error);
    }
  };

  return (
    <>
      <Chat currentUser={currentUser} onLogin={handleLogin} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
