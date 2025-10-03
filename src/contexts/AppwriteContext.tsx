/**
 * Appwrite Context
 * Provides Appwrite services throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, functions } from '@/lib/appwrite/config/client';
import type { Models } from 'appwrite';
import {
  profileService,
  web3Service,
} from '@/lib/appwrite';

interface AppwriteContextType {
  currentAccount: Models.User<Models.Preferences> | null;
  currentProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithWallet: (email: string, address: string, signature: string, message: string) => Promise<void>;
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
        // Create profile if it doesn't exist - use wallet address as username
        const walletAddress = user.prefs?.walletEth || user.email.split('@')[0];
        const newProfile = await profileService.createProfile(user.$id, {
          username: walletAddress.substring(0, 12),
          displayName: `User ${walletAddress.substring(2, 8)}`,
          email: user.email,
          walletAddress: user.prefs?.walletEth,
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

  const loginWithWallet = async (email: string, address: string, signature: string, message: string) => {
    // Get the Web3 function ID from environment
    const functionId = import.meta.env.VITE_WEB3_FUNCTION_ID;
    
    if (!functionId) {
      throw new Error('Web3 function not configured. Please set VITE_WEB3_FUNCTION_ID in your environment.');
    }

    // Call Appwrite Function for wallet authentication
    const execution = await functions.createExecution(
      functionId,
      JSON.stringify({ email, address, signature, message }),
      false // Synchronous execution
    );

    // Parse response
    const response = JSON.parse(execution.responseBody);

    if (execution.responseStatusCode !== 200) {
      throw new Error(response.error || 'Authentication failed');
    }

    // Create Appwrite session with returned credentials
    await account.createSession(
      response.userId,
      response.secret
    );

    // Fetch and set authenticated user data
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
        loginWithWallet,
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
