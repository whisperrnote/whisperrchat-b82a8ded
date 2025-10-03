/**
 * Appwrite Context
 * Provides Appwrite services throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite/config/client';
import type { Models } from 'appwrite';
import {
  profileService,
  messagingService,
  socialService,
  web3Service,
  storageService,
  realtimeService,
} from '@/lib/appwrite';

interface AppwriteContextType {
  currentAccount: Models.User<Models.Preferences> | null;
  currentProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<Models.User<Models.Preferences> | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await account.get();
      setCurrentAccount(user);
      setIsAuthenticated(true);
      
      // Load profile
      const profile = await profileService.getProfile(user.$id);
      if (profile) {
        setCurrentProfile(profile);
      } else {
        // Create profile if it doesn't exist
        const newProfile = await profileService.createProfile(user.$id, {
          username: user.name || user.email.split('@')[0],
          displayName: user.name || 'User',
          email: user.email,
        });
        setCurrentProfile(newProfile);
      }
    } catch (error) {
      console.log('Not authenticated');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    await checkAuth();
  };

  const logout = async () => {
    // Update online status
    if (currentProfile) {
      await profileService.updateOnlineStatus(currentProfile.$id, false);
    }
    
    await account.deleteSession('current');
    setCurrentAccount(null);
    setCurrentProfile(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    if (currentAccount) {
      const profile = await profileService.getProfile(currentAccount.$id);
      setCurrentProfile(profile);
    }
  };

  // Update online status on mount/unmount
  useEffect(() => {
    if (currentProfile) {
      profileService.updateOnlineStatus(currentProfile.$id, true);

      // Update presence every 30 seconds
      const interval = setInterval(() => {
        profileService.updateOnlineStatus(currentProfile.$id, true);
      }, 30000);

      return () => {
        clearInterval(interval);
        profileService.updateOnlineStatus(currentProfile.$id, false);
      };
    }
  }, [currentProfile]);

  return (
    <AppwriteContext.Provider
      value={{
        currentAccount,
        currentProfile,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
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
