// @generated whisperrchat-tool: auth-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Authentication service with identity management

import type { 
  IAuthService, 
  LoginCredentials, 
  RegisterInfo, 
  AuthResult, 
  User, 
  Identity 
} from '../types';
import { CryptoService } from './crypto.service';
import { ChainClient } from './blockchain.service';

export class AuthService implements IAuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private readonly storageKey = 'whisperr_auth_state';
  private cryptoService: CryptoService;

  constructor(cryptoService?: CryptoService) {
    try {
      this.cryptoService = cryptoService || new CryptoService();
      this.loadAuthState();
    } catch (error) {
      console.error('AuthService constructor failed:', error);
      // Don't throw, just log and continue with degraded functionality
      this.cryptoService = this.cryptoService || ({
        generateIdentity: async () => ({ id: 'stub', publicKey: '', identityKey: '', signedPreKey: '', oneTimePreKeys: [] }),
        hash: async (data: string) => btoa(data).slice(0, 32)
      } as any);
    }
  }

  async loginWithWallet(): Promise<AuthResult> {
    try {
      const chainClient = new ChainClient(this.cryptoService);
      const address = await chainClient.connectWallet();

      const identity = await this.cryptoService.generateIdentity();
      
      const user: User = {
        id: address,
        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
        identity,
        createdAt: new Date(),
        lastSeen: new Date()
      };

      const token = await this.generateSessionToken(user.id);
      
      this.currentUser = user;
      this.token = token;
      this.saveAuthState();

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
    this.clearAuthState();
  }

  async refreshToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    // TODO(ai): Implement proper token refresh with backend
    this.token = await this.generateSessionToken(this.currentUser.id);
    this.saveAuthState();
    return this.token;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  /**
   * Generate JWT-like session token (simplified for demo)
   */
  private async generateSessionToken(userId: string): Promise<string> {
    const payload = {
      userId,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    // TODO(ai): Use proper JWT signing with HMAC-SHA256
    const tokenData = btoa(JSON.stringify(payload));
    return `whisperr.${tokenData}.${await this.cryptoService.hash(tokenData)}`;
  }

  /**
   * Verify session token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const [prefix, payload, signature] = token.split('.');
      
      if (prefix !== 'whisperr') {
        return false;
      }

      const decodedPayload = JSON.parse(atob(payload));
      const expectedSignature = await this.cryptoService.hash(payload);
      
      // Check signature
      if (signature !== expectedSignature) {
        return false;
      }

      // Check expiration
      if (Date.now() > decodedPayload.exp) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save authentication state to localStorage
   */
  private saveAuthState(): void {
    if (this.currentUser && this.token) {
      const authState = {
        user: this.currentUser,
        token: this.token,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(authState));
    }
  }

  /**
   * Load authentication state from localStorage
   */
  private loadAuthState(): void {
    try {
      const storedState = localStorage.getItem(this.storageKey);
      if (storedState) {
        const authState = JSON.parse(storedState);
        
        // Check if token is still valid (24 hour expiry)
        if (Date.now() - authState.timestamp < 24 * 60 * 60 * 1000) {
          this.currentUser = authState.user;
          this.token = authState.token;
        } else {
          this.clearAuthState();
        }
      }
    } catch {
      this.clearAuthState();
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.storageKey);
  }


  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.currentUser && this.token);
  }
}

// Service instance will be created in index.ts to avoid circular dependencies