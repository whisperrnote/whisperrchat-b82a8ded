import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Chat from './pages/Chat';
import { AuthModal } from './components/auth/auth-modal';
import { AppwriteProvider, useAppwrite } from './contexts/AppwriteContext';

function AppContent() {
  const { currentAccount, currentProfile, isAuthenticated, isLoading, forceRefreshAuth } = useAppwrite();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Always show auth modal when not authenticated (persistent overlay)
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading, hasAccount: !!currentAccount });
    
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, showing auth modal');
      setShowAuthModal(true);
    } else if (isAuthenticated) {
      console.log('Authenticated, hiding auth modal');
      setShowAuthModal(false);
    }
  }, [isAuthenticated, isLoading, currentAccount]);

  const handleAuthSuccess = () => {
    console.log('Auth success callback');
    setShowAuthModal(false);
    // Force a refresh to ensure we have the latest state
    forceRefreshAuth();
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
      {/* Development debug info */}
      {import.meta.env.DEV && (
        <div className="fixed top-2 right-2 z-50 bg-black/80 text-white text-xs p-2 rounded border border-gray-700">
          <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Loading: {isLoading ? '⏳' : '✓'}</div>
          <div>Account: {currentAccount ? currentAccount.$id.slice(0, 8) : 'None'}</div>
          <div>Profile: {currentProfile ? '✓' : '❌'}</div>
        </div>
      )}
      
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
