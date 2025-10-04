/**
 * useAuth Hook
 * Convenient hook for accessing authentication functionality
 * throughout the app
 */

import { useAppwrite } from '@/contexts/AppwriteContext';
import { authService } from '@/lib/appwrite/services/auth.service';
import { useState } from 'react';
import type { Models } from 'appwrite';

export interface UseAuthResult {
  // User state
  currentUser: Models.User<Models.Preferences> | null;
  currentProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  loginWithWallet: (email: string, address: string, signature: string, message: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  sendEmailOTP: (email: string) => Promise<void>;
  verifyEmailOTP: (userId: string, secret: string) => Promise<void>;
  sendMagicURL: (email: string) => Promise<void>;
  sendPhoneOTP: (phone: string) => Promise<void>;
  verifyPhoneOTP: (userId: string, secret: string) => Promise<void>;
  loginAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile actions
  refreshProfile: () => Promise<void>;
  forceRefreshAuth: () => Promise<void>;

  // User management
  updateUserName: (name: string) => Promise<boolean>;
  updateUserPreferences: (prefs: Record<string, any>) => Promise<boolean>;
  
  // Utility
  getShortWalletAddress: () => string;
  getDisplayName: () => string;
}

export function useAuth(): UseAuthResult {
  const appwrite = useAppwrite();
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async <T,>(
    action: () => Promise<T>,
    errorMessage: string
  ): Promise<T | undefined> => {
    try {
      setError(null);
      return await action();
    } catch (err: any) {
      const message = err.message || errorMessage;
      setError(message);
      throw new Error(message);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await handleAuthAction(async () => {
      const result = await authService.loginWithEmail(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
      await appwrite.forceRefreshAuth();
    }, 'Email login failed');
  };

  const registerWithEmail = async (email: string, password: string, name?: string) => {
    await handleAuthAction(async () => {
      const result = await authService.registerWithEmail(email, password, name);
      if (!result.success) {
        throw new Error(result.error);
      }
      await appwrite.forceRefreshAuth();
    }, 'Registration failed');
  };

  const sendEmailOTP = async (email: string) => {
    await handleAuthAction(async () => {
      const result = await authService.sendEmailOTP(email);
      if (!result.success) {
        throw new Error(result.error);
      }
    }, 'Failed to send OTP');
  };

  const verifyEmailOTP = async (userId: string, secret: string) => {
    await handleAuthAction(async () => {
      const result = await authService.verifyEmailOTP(userId, secret);
      if (!result.success) {
        throw new Error(result.error);
      }
      await appwrite.forceRefreshAuth();
    }, 'OTP verification failed');
  };

  const sendMagicURL = async (email: string) => {
    await handleAuthAction(async () => {
      const result = await authService.sendMagicURL(email);
      if (!result.success) {
        throw new Error(result.error);
      }
    }, 'Failed to send magic URL');
  };

  const sendPhoneOTP = async (phone: string) => {
    await handleAuthAction(async () => {
      const result = await authService.sendPhoneOTP(phone);
      if (!result.success) {
        throw new Error(result.error);
      }
    }, 'Failed to send phone OTP');
  };

  const verifyPhoneOTP = async (userId: string, secret: string) => {
    await handleAuthAction(async () => {
      const result = await authService.verifyPhoneOTP(userId, secret);
      if (!result.success) {
        throw new Error(result.error);
      }
      await appwrite.forceRefreshAuth();
    }, 'Phone OTP verification failed');
  };

  const loginAnonymous = async () => {
    await handleAuthAction(async () => {
      const result = await authService.loginAnonymous();
      if (!result.success) {
        throw new Error(result.error);
      }
      await appwrite.forceRefreshAuth();
    }, 'Anonymous login failed');
  };

  const updateUserName = async (name: string): Promise<boolean> => {
    return await handleAuthAction(async () => {
      const result = await authService.updateName(name);
      if (result) {
        await appwrite.forceRefreshAuth();
        return true;
      }
      return false;
    }, 'Failed to update name') || false;
  };

  const updateUserPreferences = async (prefs: Record<string, any>): Promise<boolean> => {
    return await handleAuthAction(async () => {
      const result = await authService.updatePreferences(prefs);
      if (result) {
        await appwrite.forceRefreshAuth();
        return true;
      }
      return false;
    }, 'Failed to update preferences') || false;
  };

  const getShortWalletAddress = (): string => {
    const walletAddress = appwrite.currentAccount?.prefs?.walletEth as string | undefined;
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    return '';
  };

  const getDisplayName = (): string => {
    const walletAddress = appwrite.currentAccount?.prefs?.walletEth as string | undefined;
    
    return appwrite.currentProfile?.username 
      || appwrite.currentProfile?.displayName 
      || (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : null)
      || appwrite.currentAccount?.name 
      || 'User';
  };

  return {
    // Pass through from AppwriteContext
    currentUser: appwrite.currentAccount,
    currentProfile: appwrite.currentProfile,
    isAuthenticated: appwrite.isAuthenticated,
    isLoading: appwrite.isLoading,
    loginWithWallet: appwrite.loginWithWallet,
    logout: appwrite.logout,
    refreshProfile: appwrite.refreshProfile,
    forceRefreshAuth: appwrite.forceRefreshAuth,

    // Additional auth methods
    loginWithEmail,
    registerWithEmail,
    sendEmailOTP,
    verifyEmailOTP,
    sendMagicURL,
    sendPhoneOTP,
    verifyPhoneOTP,
    loginAnonymous,

    // User management
    updateUserName,
    updateUserPreferences,

    // Utility
    getShortWalletAddress,
    getDisplayName,
  };
}
