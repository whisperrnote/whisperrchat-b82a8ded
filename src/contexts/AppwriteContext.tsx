/**
 * Appwrite Context
 * Provides Appwrite services throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, functions } from '@/lib/appwrite/config/client';
import type { Models } from 'appwrite';
import type { Profiles } from '@/types/appwrite.d';
import {
  profileService,
  web3Service,
} from '@/lib/appwrite';

interface AppwriteContextType {
  currentAccount: Models.User<Models.Preferences> | null;
  currentProfile: Profiles | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithWallet: (email: string, address: string, signature: string, message: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshAuth: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<Models.User<Models.Preferences> | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profiles | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount - runs only once
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
        
        // Load or create profile
        try {
          let profile = await profileService.getProfile(user.$id);
          
          if (!profile) {
            console.log('[Auth] Creating new profile...');
            const walletAddress = (user.prefs?.walletEth as string) || user.email.split('@')[0];
            profile = await profileService.createProfile(user.$id, {
              username: walletAddress.substring(0, 12),
              displayName: `User ${walletAddress.substring(2, 8)}`,
              email: user.email,
              walletAddress: user.prefs?.walletEth as string,
            });
          }
          
          if (mounted) {
            console.log('[Auth] Profile loaded:', profile.$id);
            setCurrentProfile(profile);
          }
        } catch (profileError) {
          console.error('[Auth] Profile error:', profileError);
        }
      } catch (error: any) {
        if (mounted) {
          console.log('[Auth] Not authenticated');
          setIsAuthenticated(false);
          setCurrentAccount(null);
          setCurrentProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Auth check complete');
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - runs once on mount

  const checkAuth = async () => {
    try {
      console.log('[Auth] Re-checking authentication...');
      const user = await account.get();
      console.log('[Auth] User found:', user.$id);
      
      setCurrentAccount(user);
      setIsAuthenticated(true);
      
      // Load profile
      try {
        const profile = await profileService.getProfile(user.$id);
        if (profile) {
          console.log('[Auth] Profile loaded:', profile.$id);
          setCurrentProfile(profile);
        } else {
          console.log('[Auth] Creating new profile...');
          const walletAddress = (user.prefs?.walletEth as string) || user.email.split('@')[0];
          const newProfile = await profileService.createProfile(user.$id, {
            username: walletAddress.substring(0, 12),
            displayName: `User ${walletAddress.substring(2, 8)}`,
            email: user.email,
            walletAddress: user.prefs?.walletEth as string,
          });
          console.log('[Auth] Profile created:', newProfile.$id);
          setCurrentProfile(newProfile);
        }
      } catch (profileError) {
        console.error('[Auth] Profile error:', profileError);
      }
    } catch (error: any) {
      console.log('[Auth] Not authenticated:', error?.message || error);
      setIsAuthenticated(false);
      setCurrentAccount(null);
      setCurrentProfile(null);
    }
  };

  const loginWithWallet = async (email: string, address: string, signature: string, message: string) => {
    try {
      console.log('Starting wallet authentication...');
      
      // Get the Web3 function ID from environment
      const functionId = import.meta.env.VITE_WEB3_FUNCTION_ID;
      
      if (!functionId) {
        throw new Error('Web3 function not configured. Please set VITE_WEB3_FUNCTION_ID in your environment.');
      }

      console.log('Calling Web3 function...');
      // Call Appwrite Function for wallet authentication
      const execution = await functions.createExecution(
        functionId,
        JSON.stringify({ email, address, signature, message }),
        false // Synchronous execution
      );

      console.log('Function response:', execution.responseStatusCode);
      
      // Parse response
      const response = JSON.parse(execution.responseBody || '{}');

      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Authentication failed');
      }

      console.log('Creating session with userId:', response.userId);
      
      // Create Appwrite session with returned credentials
      // Use object parameter style for better compatibility
      await account.createSession({
        userId: response.userId,
        secret: response.secret
      });

      console.log('Session created successfully');

      // Fetch and set authenticated user data
      await checkAuth();
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      
      // Update online status
      if (currentProfile) {
        await profileService.updateOnlineStatus(currentProfile.$id, false);
      }
      
      await account.deleteSession('current');
      console.log('Session deleted');
      
      setCurrentAccount(null);
      setCurrentProfile(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force clear state even if API call fails
      setCurrentAccount(null);
      setCurrentProfile(null);
      setIsAuthenticated(false);
    }
  };

  const refreshProfile = async () => {
    if (currentAccount) {
      const profile = await profileService.getProfile(currentAccount.$id);
      setCurrentProfile(profile);
    }
  };

  const forceRefreshAuth = async () => {
    console.log('[Auth] Force refreshing authentication state...');
    setIsLoading(true);
    try {
      await checkAuth();
    } finally {
      setIsLoading(false);
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
        forceRefreshAuth,
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
