import { account, functions } from '../lib/appwrite';
import { ID, Models, ExecutionMethod } from 'appwrite';
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

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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
      let optionsExecution = await functions.createExecution(
        'webauthn-auth-options',
        JSON.stringify({ email }),
        false
      );

      let optionsResult = JSON.parse(optionsExecution.responseBody);

      if (optionsExecution.responseStatusCode === 403 || optionsExecution.responseStatusCode === 404) {
        optionsExecution = await functions.createExecution(
          'webauthn-register-options',
          JSON.stringify({ email }),
          false
        );

        if (optionsExecution.responseStatusCode !== 200) {
          return { success: false, error: 'Failed to get registration options' };
        }

        const options = JSON.parse(optionsExecution.responseBody).data;
        options.challenge = base64UrlToBuffer(options.challenge);
        options.user.id = base64UrlToBuffer(options.user.id);

        const credential = await navigator.credentials.create({ publicKey: options });
        
        if (!credential) {
          return { success: false, error: 'Credential creation failed' };
        }

        const credentialJSON = publicKeyCredentialToJSON(credential);
        
        const verifyExecution = await functions.createExecution(
          'webauthn-register-verify',
          JSON.stringify({ email, credential: credentialJSON }),
          false
        );

        if (verifyExecution.responseStatusCode !== 200) {
          return { success: false, error: 'Registration verification failed' };
        }

        const { token } = JSON.parse(verifyExecution.responseBody).data;
        const session = await account.createSession('current', token);
        const appwriteUser = await account.get();
        await this.loadUserFromAppwrite(appwriteUser);

        return { success: true, user: this.currentUser!, token: session.$id };
      }

      const authOptions = optionsResult.data;
      authOptions.challenge = base64UrlToBuffer(authOptions.challenge);
      if (authOptions.allowCredentials) {
        authOptions.allowCredentials = authOptions.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64UrlToBuffer(cred.id)
        }));
      }

      const assertion = await navigator.credentials.get({ publicKey: authOptions });
      
      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      const assertionJSON = publicKeyCredentialToJSON(assertion);

      const verifyExecution = await functions.createExecution(
        'webauthn-auth-verify',
        JSON.stringify({ email, credential: assertionJSON }),
        false
      );

      if (verifyExecution.responseStatusCode !== 200) {
        return { success: false, error: 'Authentication verification failed' };
      }

      const { token } = JSON.parse(verifyExecution.responseBody).data;
      const session = await account.createSession('current', token);
      const appwriteUser = await account.get();
      await this.loadUserFromAppwrite(appwriteUser);

      return { success: true, user: this.currentUser!, token: session.$id };
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

      const execution = await functions.createExecution(
        'custom-token',
        JSON.stringify({
          email: credentials.email,
          address,
          signature,
          message: fullMessage
        }),
        false
      );

      if (execution.responseStatusCode !== 200) {
        const errorData = JSON.parse(execution.responseBody);
        return { success: false, error: errorData.message || 'Verification failed' };
      }

      const { token } = JSON.parse(execution.responseBody).data;

      const session = await account.createSession('current', token);
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
