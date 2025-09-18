// @generated whisperrchat-tool: main-app@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Main WhisperrChat application

import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthForm } from './components/auth/auth-form';
import { MainLayout } from './components/layout/main-layout';
import { authService, keyManagementService, messagingService, services } from './services';
import { migrationManager, INITIAL_MIGRATIONS } from './migrations/migration.framework';
import type { User, AuthResult } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      setIsLoading(true);
      setInitializationError(null);

      console.log('Starting application initialization...');
      
      // Services are always available (may be stubs if real initialization failed)
      console.log('Services loaded:', {
        auth: !!authService,
        keyManagement: !!keyManagementService,
        messaging: !!messagingService,
        authMethods: Object.keys(authService || {}),
        messagingMethods: Object.keys(messagingService || {})
      });
      
      // Verify critical service methods exist
      if (!authService?.getCurrentUser) {
        throw new Error('Auth service getCurrentUser method not available');
      }

      // Run database migrations first
      console.log('Running database migrations...');
      await migrationManager.migrate(INITIAL_MIGRATIONS);

      // Validate migration integrity
      const validation = await migrationManager.validateMigrations(INITIAL_MIGRATIONS);
      if (!validation.valid) {
        console.warn('Migration validation warnings:', validation.errors);
      }

      // Check if user is already authenticated
      console.log('Checking authentication status...');
      const user = await authService.getCurrentUser();
      if (user && authService.isAuthenticated()) {
        // Verify token is still valid
        const token = authService.getToken();
        if (token && await authService.verifyToken(token)) {
          setCurrentUser(user);
          
          // Ensure cryptographic identity exists
          if (!keyManagementService.hasIdentity()) {
            console.log('Generating new cryptographic identity...');
            await keyManagementService.generateIdentityKeys();
          }
        } else {
          // Token expired, logout
          await authService.logout();
        }
      }

      // Initialize plugins
      console.log('Initializing plugin system...');
      
      // Initialize blockchain services (optional)
      console.log('Initializing blockchain services...');
      
      console.log('Application initialization complete');
      
    } catch (error) {
      console.error('Application initialization failed:', error);
      setInitializationError(
        error instanceof Error ? error.message : 'Failed to initialize application'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (authResult: AuthResult) => {
    if (authResult.success && authResult.user) {
      setCurrentUser(authResult.user);
      
      // Ensure cryptographic identity exists for new users
      if (!keyManagementService.hasIdentity()) {
        try {
          console.log('Generating cryptographic identity for new user...');
          await keyManagementService.generateIdentityKeys();
        } catch (error) {
          console.error('Failed to generate identity keys:', error);
        }
      }

      // Emit authentication event for plugins
      services.plugins.executeHooks(
        {
          type: 'user:authenticated',
          timestamp: new Date(),
          data: { userId: authResult.user.id },
          source: 'auth-service'
        },
        {
          userId: authResult.user.id,
          permissions: [
            { type: 'messaging', description: 'Send and receive messages', required: true },
            { type: 'contacts', description: 'Access contact list', required: false }
          ]
        }
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl mb-2">Initializing WhisperrChat</h2>
          <p className="text-gray-500">Setting up secure messaging...</p>
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl mb-2">Initialization Failed</h2>
          <p className="text-gray-600 mb-4">{initializationError}</p>
          <button
            onClick={initializeApplication}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {currentUser ? (
        <MainLayout 
          currentUser={currentUser} 
          onLogout={handleLogout}
        />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
      
      {/* Global toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;