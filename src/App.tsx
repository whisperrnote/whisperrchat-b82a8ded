import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Chat from './pages/Chat';
import { AuthModal } from './components/auth/auth-modal';
import { AppwriteProvider, useAppwrite } from './contexts/AppwriteContext';

function AppContent() {
  const { currentAccount, currentProfile, isAuthenticated, isLoading } = useAppwrite();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Always show auth modal when not authenticated (persistent overlay)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  // Convert Appwrite account to legacy User type for compatibility
  const legacyUser = currentAccount && currentProfile ? {
    id: currentAccount.$id,
    displayName: currentProfile.displayName || currentAccount.name,
    identity: {
      id: currentAccount.$id,
      publicKey: '',
      identityKey: '',
      signedPreKey: '',
      oneTimePreKeys: [],
    },
    createdAt: new Date(currentAccount.$createdAt),
    lastSeen: new Date(currentProfile.lastSeen || currentAccount.$createdAt),
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading WhisperChat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Blur and disable interaction when not authenticated */}
      <div className={!isAuthenticated ? 'blur-sm pointer-events-none' : ''}>
        <Chat 
          currentUser={legacyUser} 
          onLogin={() => setShowAuthModal(true)}
        />
      </div>
      
      {/* Persistent auth overlay - cannot be dismissed when not authenticated */}
      <AuthModal 
        open={showAuthModal}
        onOpenChange={(open) => {
          // Only allow closing if authenticated
          if (isAuthenticated) {
            setShowAuthModal(open);
          }
        }}
        onSuccess={handleAuthSuccess}
      />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <AppwriteProvider>
      <AppContent />
    </AppwriteProvider>
  );
}

export default App;
