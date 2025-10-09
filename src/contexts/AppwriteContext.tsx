/**
 * Appwrite Context
 * Provides Appwrite services throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite/config/client';
import { authService, userService } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import type { User } from '@/lib/appwrite';

interface AppwriteContextType {
  currentAccount: Models.User<Models.Preferences> | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<Models.User<Models.Preferences> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Checking authentication...');
        const user = await account.get();
        
        if (!mounted) return;
        
        console.log('[Auth] User found:', user.$id);
        setCurrentAccount(user);
        setIsAuthenticated(true);
        
        // Load user from database
        try {
          const dbUser = await userService.getUser(user.$id);
          if (mounted && dbUser) {
            setCurrentUser(dbUser);
          }
        } catch (error) {
          console.error('[Auth] Error loading user:', error);
        }
      } catch (error) {
        console.log('[Auth] Not authenticated');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentAccount(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!currentAccount) return;
    
    try {
      const dbUser = await userService.getUser(currentAccount.$id);
      if (dbUser) {
        setCurrentUser(dbUser);
      }
    } catch (error) {
      console.error('[Auth] Error refreshing user:', error);
    }
  };

  return (
    <AppwriteContext.Provider
      value={{
        currentAccount,
        currentUser,
        isAuthenticated,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwrite() {
  const context = useContext(AppwriteContext);
  if (context === undefined) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
}
