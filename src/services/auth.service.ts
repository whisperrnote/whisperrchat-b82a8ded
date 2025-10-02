import { account, functions } from '../lib/appwrite';
import { Models } from 'appwrite';
import type { User, AuthResult } from '../types';
import { CryptoService } from './crypto.service';

export class AuthService {
  private currentUser: User | null = null;
  private cryptoService: CryptoService;

  constructor(cryptoService?: CryptoService) {
    this.cryptoService = cryptoService || new CryptoService();
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const session = await account.get();
      if (session) {
        await this.loadUserFromAppwrite(session);
      }
    } catch (error) {
      console.log('No active session');
    }
  }

  private async loadUserFromAppwrite(appwriteUser: Models.User<Models.Preferences>): Promise<void> {
    const identity = await this.cryptoService.generateIdentity();
    
    this.currentUser = {
      id: appwriteUser.$id,
      displayName: appwriteUser.name || appwriteUser.email || 'User',
      identity,
      createdAt: new Date(appwriteUser.$createdAt),
      lastSeen: new Date()
    };
  }

  async loginWithWallet(email: string): Promise<AuthResult> {
    try {
      // Step 1: Check MetaMask
      if (!window.ethereum) {
        return { success: false, error: 'MetaMask not installed. Please install MetaMask browser extension.' };
      }

      // Step 2: Connect wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        return { success: false, error: 'No wallet account selected' };
      }

      const address = accounts[0];

      // Step 3: Generate authentication message
      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      // Step 4: Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      });

      // Step 5: Call Appwrite Function
      const functionId = import.meta.env.VITE_WEB3_FUNCTION_ID;
      if (!functionId) {
        return { success: false, error: 'Web3 function not configured. Please set VITE_WEB3_FUNCTION_ID.' };
      }

      const execution = await functions.createExecution(
        functionId,
        JSON.stringify({ email, address, signature, message }),
        false // Synchronous execution
      );

      // Step 6: Parse response
      const response = JSON.parse(execution.responseBody || '{}');
      if (execution.responseStatusCode !== 200) {
        const errorMessage = response?.error || 'Authentication failed';
        return { success: false, error: errorMessage };
      }

      // Step 7: Create Appwrite session
      await account.createSession({ 
        userId: response.userId, 
        secret: response.secret 
      });

      // Step 8: Get user data
      const appwriteUser = await account.get();
      await this.loadUserFromAppwrite(appwriteUser);

      return { success: true, user: this.currentUser! };
    } catch (error: any) {
      // Handle user rejection
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        return { success: false, error: 'You rejected the signature request. Please try again.' };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wallet authentication failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.currentUser = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) {
      try {
        const appwriteUser = await account.get();
        await this.loadUserFromAppwrite(appwriteUser);
      } catch (error) {
        return null;
      }
    }
    return this.currentUser;
  }

  async refreshToken(): Promise<string> {
    try {
      const jwt = await account.createJWT();
      return jwt.jwt;
    } catch {
      return '';
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}
