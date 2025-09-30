import { Client, Users, ID, Query } from 'node-appwrite';
import crypto from 'crypto';
import * as SimpleWebAuthnServer from '@simplewebauthn/server';

const client = new Client();
const serverEndpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const serverProject = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';
const serverApiKey = process.env.APPWRITE_API_KEY || '';

client.setEndpoint(serverEndpoint);
if (!serverProject) {
  throw new Error('Missing APPWRITE_PROJECT or NEXT_PUBLIC_APPWRITE_PROJECT');
}
client.setProject(serverProject);
if (!serverApiKey) {
  throw new Error('Missing APPWRITE_API_KEY');
}
client.setKey(serverApiKey);

const users = new Users(client);

export class PasskeyServer {
  async getUserIfExists(email: string): Promise<any | null> {
    const usersList = await users.list([Query.equal('email', email), Query.limit(1)]);
    return (usersList as any).users?.[0] ?? null;
  }

  private parseCredsMap(str: string | undefined): Record<string, string> {
    if (!str) return {};
    try { return JSON.parse(str) as Record<string, string>; } catch { return {}; }
  }

  async shouldBlockPasskeyForEmail(email: string): Promise<boolean> {
    const user = await this.getUserIfExists(email);
    if (!user) return false;
    const hasWallet = !!(user.prefs?.walletEth);
    const credsObj = this.parseCredsMap(user.prefs?.passkey_credentials as string | undefined);
    const hasPasskeys = Object.keys(credsObj).length > 0;
    return hasWallet && !hasPasskeys;
  }
  async prepareUser(email: string) {
    const usersList = await users.list([Query.equal('email', email), Query.limit(1)]);
    if ((usersList as any).users?.length > 0) {
      return (usersList as any).users[0];
    }
    return await users.create(ID.unique(), email);
  }

  async registerPasskey(
    email: string,
    credentialData: any,
    challenge: string,
    opts?: { rpID?: string; origin?: string }
  ) {
    const user = await this.prepareUser(email);

    const verification = await (SimpleWebAuthnServer.verifyRegistrationResponse as any)({
      response: credentialData,
      expectedChallenge: challenge,
      expectedOrigin: opts?.origin || process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
      expectedRPID: opts?.rpID || process.env.NEXT_PUBLIC_RP_ID || 'localhost'
    });

    if (!verification.verified) {
      throw new Error('Registration verification failed');
    }

    const registrationInfo: any = (verification as any).registrationInfo;
    const cred = registrationInfo?.credential || {};
    const passkeyData = {
      id: typeof cred.id === 'string' ? cred.id : Buffer.from(cred.id || new Uint8Array()).toString('base64url'),
      publicKey: Buffer.from(cred.publicKey || new Uint8Array()).toString('base64url'),
      counter: typeof cred.counter === 'number' ? cred.counter : (registrationInfo.counter || 0),
      transports: Array.isArray(cred.transports) ? cred.transports : (credentialData.response?.transports || [])
    };
    if (!passkeyData.id || !passkeyData.publicKey) {
      throw new Error('RegistrationInfo missing credential id/publicKey');
    }

    const existingPrefs = user.prefs || {};
    const credentialsStr = (existingPrefs.passkey_credentials || '') as string;
    const countersStr = (existingPrefs.passkey_counter || '') as string;

    const credObj: Record<string, string> = credentialsStr ? (JSON.parse(credentialsStr) as Record<string, string>) : {};
    const counterObj: Record<string, number> = countersStr ? (JSON.parse(countersStr) as Record<string, number>) : {};
    
    credObj[passkeyData.id] = passkeyData.publicKey;
    counterObj[passkeyData.id] = passkeyData.counter;
    
    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_credentials = JSON.stringify(credObj);
    mergedPrefs.passkey_counter = JSON.stringify(counterObj);
    await users.updatePrefs(user.$id, mergedPrefs);

    const token = await users.createToken(user.$id, 64, 60);

    return {
      success: true,
      token: {
        secret: token.secret,
        userId: user.$id
      }
    };
  }

  async authenticatePasskey(
    email: string,
    assertion: any,
    challenge: string,
    opts?: { rpID?: string; origin?: string }
  ) {
    const user = await this.prepareUser(email);

    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const countersStr = (user.prefs?.passkey_counter || '') as string;

    if (!credentialsStr) {
      throw new Error('No passkeys found for user');
    }
    
    const credObj: Record<string, string> = JSON.parse(credentialsStr) as Record<string, string>;
    const counterObj: Record<string, number> = countersStr ? (JSON.parse(countersStr) as Record<string, number>) : {};
    
    const credentialId = assertion.rawId || assertion.id;
    const publicKey = credObj[credentialId];
    const counter = counterObj[credentialId] || 0;
    
    if (!publicKey) {
      throw new Error('Unknown credential');
    }

    const verification = await (SimpleWebAuthnServer.verifyAuthenticationResponse as any)({
      response: assertion,
      expectedChallenge: challenge,
      expectedOrigin: opts?.origin || process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
      expectedRPID: opts?.rpID || process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      credential: {
        counter: counter,
        id: Buffer.from(credentialId, 'base64url'),
        publicKey: Buffer.from(publicKey, 'base64url'),
      }
    });

    if (!verification.verified) {
      throw new Error('Authentication verification failed');
    }

    const authInfo: any = (verification as any).authenticationInfo;
    const newCounter = (authInfo && typeof authInfo.newCounter === 'number') ? authInfo.newCounter : counter;
    counterObj[credentialId] = newCounter;
    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_counter = JSON.stringify(counterObj);
    await users.updatePrefs(user.$id, mergedPrefs);

    const token = await users.createToken(user.$id, 64, 60);

    return {
      success: true,
      token: {
        secret: token.secret,
        userId: user.$id
      }
    };
  }

  async getPasskeysByEmail(email: string): Promise<Array<{ id: string; publicKey: string; counter: number }>> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    if (!credentialsStr) return [];
    const credObj: Record<string, string> = JSON.parse(credentialsStr) as Record<string, string>;
    return Object.entries(credObj).map(([id, pk]) => ({ id, publicKey: pk, counter: 0 }));
  }
}
