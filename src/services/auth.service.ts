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

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function publicKeyCredentialToJSON(pubKeyCred: any): any {
  if (Array.isArray(pubKeyCred)) {
    return pubKeyCred.map(publicKeyCredentialToJSON);
  }
  if (pubKeyCred instanceof ArrayBuffer) {
    return bufferToBase64Url(pubKeyCred);
  }
  if (pubKeyCred && typeof pubKeyCred === 'object') {
    const obj: any = {};
    for (const key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  }
  return pubKeyCred;
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
      if (isRegistration) {
        const options = await this.generateRegistrationOptions(email);
        const credential = await navigator.credentials.create({ publicKey: options });
        
        if (!credential) {
          return { success: false, error: 'Credential creation failed' };
        }

        const credentialJSON = publicKeyCredentialToJSON(credential);
        
        const token = await account.createJWT();
        
        await account.updatePrefs({
          passkey: credentialJSON,
          passkeyChallenge: options.challenge
        });

        const appwriteUser = await account.get();
        await this.loadUserFromAppwrite(appwriteUser);

        return { success: true, user: this.currentUser!, token: token.jwt };
      } else {
        const options = await this.generateAuthenticationOptions(email);
        const assertion = await navigator.credentials.get({ publicKey: options });
        
        if (!assertion) {
          return { success: false, error: 'Authentication failed' };
        }

        const appwriteUser = await account.get();
        await this.loadUserFromAppwrite(appwriteUser);

        const token = await account.createJWT();
        return { success: true, user: this.currentUser!, token: token.jwt };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Passkey authentication failed'
      };
    }
  }

  async loginWithWallet(credentials: WalletCredentials): Promise<AuthResult> {
    try {
      if (!(window as any).ethereum) {
        return { success: false, error: 'No wallet found. Please install MetaMask.' };
      }

      if (!credentials.address || !credentials.signature) {
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

        return {
          success: true,
          requiresSignature: true,
          user: undefined,
          token: undefined,
          address,
          signature,
          message
        };
      }

      const existingUser = await account.get().catch(() => null);
      
      if (existingUser) {
        await account.updatePrefs({
          ...existingUser.prefs,
          walletEth: credentials.address.toLowerCase()
        });
      } else {
        await account.create(ID.unique(), credentials.email, undefined, credentials.email);
        await account.updatePrefs({
          walletEth: credentials.address.toLowerCase()
        });
      }

      const appwriteUser = await account.get();
      await this.loadUserFromAppwrite(appwriteUser);

      return {
        success: true,
        user: this.currentUser!,
        token: appwriteUser.$id
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

  private async generateRegistrationOptions(email: string): Promise<any> {
    const rpName = 'WhisperChat';
    const rpID = window.location.hostname;
    
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
      challenge: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(32))),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      attestation: 'none',
      timeout: 60000
    };
  }

  private async generateAuthenticationOptions(email: string): Promise<any> {
    const rpID = window.location.hostname;
    
    return {
      challenge: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(32))),
      rpId: rpID,
      timeout: 60000,
      userVerification: 'preferred'
    };
  }
}
