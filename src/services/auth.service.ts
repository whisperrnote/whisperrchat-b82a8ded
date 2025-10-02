import { account, functions } from '../lib/appwrite';
import { ID, Models } from 'appwrite';
import type { User, AuthResult } from '../types';
import { CryptoService } from './crypto.service';

export type AuthMethod = 'wallet';

export interface WalletCredentials {
  email: string;
}

export class AuthService {
  private currentUser: User | null = null;
  private appwriteUser: Models.User<Models.Preferences> | null = null;
  private cryptoService: CryptoService;

  constructor(cryptoService?: CryptoService) {
    this.cryptoService = cryptoService || new CryptoService();
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const session = await account.get();
      if (session) {
        this.appwriteUser = session;
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
      displayName: appwriteUser.name || appwriteUser.email || appwriteUser.phone || 'User',
      identity,
      createdAt: new Date(appwriteUser.$createdAt),
      lastSeen: new Date()
    };
  }

  async loginWithWallet(email: string): Promise<AuthResult> {
    try {
      if (!(window as any).ethereum) {
        return { success: false, error: 'No wallet found. Please install MetaMask.' };
      }

      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        return { success: false, error: 'No wallet account selected' };
      }

      const address = accounts[0];
      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      });

      const functionId = import.meta.env.VITE_WEB3_FUNCTION_ID;
      if (!functionId) {
        return { success: false, error: 'Missing VITE_WEB3_FUNCTION_ID' };
      }

      const execution = await functions.createExecution(
        functionId,
        JSON.stringify({ email, address, signature, message }),
        false
      );

      const response = JSON.parse(execution.responseBody || '{}');
      if (execution.responseStatusCode !== 200) {
        const errorMessage = response?.error || 'Authentication failed';
        return { success: false, error: errorMessage };
      }

      await account.createSession({ userId: response.userId, secret: response.secret });
      const appwriteUser = await account.get();
      await this.loadUserFromAppwrite(appwriteUser);

      return { success: true, user: this.currentUser! };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wallet login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.currentUser = null;
      this.appwriteUser = null;
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

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  async getSession(): Promise<Models.Session | null> {
    try {
      return await account.getSession('current');
    } catch {
      return null;
    }
  }
}
