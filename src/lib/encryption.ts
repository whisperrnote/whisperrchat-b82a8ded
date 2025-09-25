/**
 * End-to-End Encryption System
 * Provides secure message encryption using per-device RSA keys with AES message encryption
 */

// Generate a device fingerprint for unique device identification
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown'
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
};

// Generate RSA key pair for device
export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Export public key to PEM format
export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('spki', key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
};

// Export private key to encrypted format
export const exportPrivateKey = async (key: CryptoKey, password: string): Promise<string> => {
  const exported = await crypto.subtle.exportKey('pkcs8', key);
  
  // Derive key from password using PBKDF2
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // Encrypt the private key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    exported
  );
  
  // Combine salt, iv, and encrypted key
  const combined = new Uint8Array(salt.length + iv.length + encryptedKey.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedKey), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

// Import public key from PEM format
export const importPublicKey = async (pemKey: string): Promise<CryptoKey> => {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pemKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
};

// Import private key from encrypted format
export const importPrivateKey = async (encryptedKey: string, password: string): Promise<CryptoKey> => {
  const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  // Derive key from password
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // Decrypt the private key
  const decryptedKey = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    encrypted
  );
  
  return await crypto.subtle.importKey(
    'pkcs8',
    decryptedKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
};

// Generate symmetric key for message encryption
export const generateSymmetricKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt message content with symmetric key
export const encryptMessage = async (message: string, symmetricKey: CryptoKey): Promise<{ 
  encryptedContent: string; 
  iv: string; 
}> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    symmetricKey,
    data
  );
  
  return {
    encryptedContent: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

// Decrypt message content with symmetric key
export const decryptMessage = async (
  encryptedContent: string, 
  iv: string, 
  symmetricKey: CryptoKey
): Promise<string> => {
  const encrypted = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    symmetricKey,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

// Encrypt symmetric key with recipient's public key
export const encryptSymmetricKey = async (
  symmetricKey: CryptoKey, 
  publicKey: CryptoKey
): Promise<string> => {
  const exported = await crypto.subtle.exportKey('raw', symmetricKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    exported
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};

// Decrypt symmetric key with private key
export const decryptSymmetricKey = async (
  encryptedKey: string, 
  privateKey: CryptoKey
): Promise<CryptoKey> => {
  const encrypted = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encrypted
  );
  
  return await crypto.subtle.importKey(
    'raw',
    decrypted,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

// Generate key fingerprint for verification
export const generateKeyFingerprint = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const hash = await crypto.subtle.digest('SHA-256', exported);
  return btoa(String.fromCharCode(...new Uint8Array(hash))).slice(0, 16);
};

// Secure storage for device keys
export class SecureKeyStorage {
  private static readonly KEY_PREFIX = 'whisperrchat_';
  
  static async storeDeviceKeys(
    publicKey: CryptoKey, 
    privateKey: CryptoKey, 
    password: string,
    deviceId: string
  ): Promise<void> {
    const publicPem = await exportPublicKey(publicKey);
    const encryptedPrivate = await exportPrivateKey(privateKey, password);
    
    localStorage.setItem(`${this.KEY_PREFIX}public_${deviceId}`, publicPem);
    localStorage.setItem(`${this.KEY_PREFIX}private_${deviceId}`, encryptedPrivate);
  }
  
  static async loadDeviceKeys(
    password: string, 
    deviceId: string
  ): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null> {
    try {
      const publicPem = localStorage.getItem(`${this.KEY_PREFIX}public_${deviceId}`);
      const encryptedPrivate = localStorage.getItem(`${this.KEY_PREFIX}private_${deviceId}`);
      
      if (!publicPem || !encryptedPrivate) return null;
      
      const publicKey = await importPublicKey(publicPem);
      const privateKey = await importPrivateKey(encryptedPrivate, password);
      
      return { publicKey, privateKey };
    } catch {
      return null;
    }
  }
  
  static clearDeviceKeys(deviceId: string): void {
    localStorage.removeItem(`${this.KEY_PREFIX}public_${deviceId}`);
    localStorage.removeItem(`${this.KEY_PREFIX}private_${deviceId}`);
  }
}