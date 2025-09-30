import { account } from '../lib/appwrite';
import { ID, Models } from 'appwrite';
import type { User, AuthResult } from '../types';
import { CryptoService } from './crypto.service';

export type AuthMethod = 'otp' | 'passkey' | 'wallet';

export interface OTPCredentials {
  email: string;
  code?: string;
  userId?: string;
}

export interface PasskeyCredentials {
  email: string;
}

export interface WalletCredentials {
  email: string;
  address?: string;
  signature?: string;
  message?: string;
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

  async loginWithOTP(credentials: OTPCredentials): Promise<AuthResult> {
    try {
      if (!credentials.code) {
        const token = await account.createEmailToken(
          ID.unique(),
          credentials.email
        );
        
        return {
          success: true,
          requiresOTP: true,
          user: undefined,
          token: token.userId
        };
      }

      if (!credentials.userId) {
        throw new Error('User ID is required for OTP verification');
      }

      const session = await account.createSession(
        credentials.userId,
        credentials.code
      );

      const appwriteUser = await account.get();
      await this.loadUserFromAppwrite(appwriteUser);

      return {
        success: true,
        user: this.currentUser!,
        token: session.$id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP login failed'
      };
    }
  }

  async loginWithPasskey(email: string, isRegistration: boolean = false): Promise<AuthResult> {
    if (!('credentials' in navigator)) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    try {
      // MVP: Simplified client-side passkey using browser credentials API
      // Store credential data in localStorage (for MVP only)
      const storedCreds = localStorage.getItem(`passkey_${email}`);
      
      if (!storedCreds || isRegistration) {
        // Registration flow
        const options = await this.generatePasskeyRegistrationOptions(email);
        const credential = await navigator.credentials.create({ publicKey: options });
        
        if (!credential) {
          return { success: false, error: 'Credential creation failed' };
        }

        // Store credential metadata
        const credData = {
          id: credential.id,
          email,
          createdAt: Date.now()
        };
        localStorage.setItem(`passkey_${email}`, JSON.stringify(credData));

        // Create account via email OTP as fallback, then mark as passkey user
        const token = await account.createEmailToken(ID.unique(), email);
        
        return {
          success: true,
          requiresOTP: true,
          user: undefined,
          token: token.userId,
          message: 'Passkey registered! Check your email for verification code.'
        };
      }

      // Authentication flow
      const options = await this.generatePasskeyAuthOptions(email);
      const assertion = await navigator.credentials.get({ publicKey: options });
      
      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      // Create token for login
      const token = await account.createEmailToken(ID.unique(), email);
      
      return {
        success: true,
        requiresOTP: true,
        user: undefined,
        token: token.userId,
        message: 'Passkey verified! Check your email for login code.'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Passkey authentication failed'
      };
    }
  }

  private async generatePasskeyRegistrationOptions(email: string): Promise<PublicKeyCredentialCreationOptions> {
    const rpName = import.meta.env.VITE_RP_NAME || 'TenChat';
    const rpID = import.meta.env.VITE_RP_ID || window.location.hostname;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const userId = new Uint8Array(hashBuffer);

    return {
      rp: { name: rpName, id: rpID },
      user: {
        id: userId,
        name: email,
        displayName: email
      },
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      attestation: 'none',
      timeout: 60000
    };
  }

  private async generatePasskeyAuthOptions(email: string): Promise<PublicKeyCredentialRequestOptions> {
    const rpID = import.meta.env.VITE_RP_ID || window.location.hostname;
    
    return {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: rpID,
      timeout: 60000,
      userVerification: 'preferred'
    };
  }

  async loginWithWallet(credentials: WalletCredentials): Promise<AuthResult> {
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

      // MVP: Client-side only verification
      // Store wallet binding in localStorage (for MVP)
      const walletData = {
        email: credentials.email,
        address: address.toLowerCase(),
        signature,
        message: fullMessage,
        timestamp
      };
      localStorage.setItem(`wallet_${credentials.email}`, JSON.stringify(walletData));

      // Use email token as fallback auth
      const token = await account.createEmailToken(ID.unique(), credentials.email);
      
      return {
        success: true,
        requiresOTP: true,
        user: undefined,
        token: token.userId,
        message: 'Wallet connected! Check your email for verification code.'
      };
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
