import { describe, it, expect } from 'vitest';
import { cryptoService } from '../services';

/**
 * Property-based test utilities
 */
class PropertyTesting {
  static async forAll<T>(
    generator: () => T,
    property: (value: T) => Promise<boolean>,
    iterations: number = 100
  ): Promise<void> {
    for (let i = 0; i < iterations; i++) {
      const value = generator();
      const result = await property(value);
      expect(result).toBe(true);
    }
  }

  static randomString(length: number = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static randomBytes(length: number = 32): string {
    return cryptoService.generateRandomBytes(length);
  }
}

describe('CryptoService', () => {
  describe('Key Generation', () => {
    it('should generate valid key pairs', async () => {
      const keyPair = await cryptoService.generateKeyPair();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).not.toEqual(keyPair.privateKey);
    });

    it('should generate unique key pairs', async () => {
      const keyPair1 = await cryptoService.generateKeyPair();
      const keyPair2 = await cryptoService.generateKeyPair();
      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey);
    });

    it('should generate valid identities', async () => {
      const identity = await cryptoService.generateIdentity();
      expect(identity.id).toBeDefined();
      expect(identity.publicKey).toBeDefined();
      expect(identity.identityKey).toBeDefined();
      expect(identity.oneTimePreKeys.length).toBe(100);
    });
  });

  describe('Encryption/Decryption', () => {
    it('encryption roundtrip should preserve data', async () => {
      await PropertyTesting.forAll(
        () => PropertyTesting.randomString(Math.floor(Math.random() * 1000) + 1),
        async (plaintext: string) => {
          const key = PropertyTesting.randomBytes(32);
          const { ciphertext, nonce } = await cryptoService.encryptMessage(plaintext, key);
          const decrypted = await cryptoService.decryptMessage(ciphertext, key, nonce);
          return decrypted === plaintext;
        },
        50
      );
    });

    it('should fail decryption with wrong key', async () => {
      const plaintext = 'secret message';
      const key1 = PropertyTesting.randomBytes(32);
      const key2 = PropertyTesting.randomBytes(32);
      const { ciphertext, nonce } = await cryptoService.encryptMessage(plaintext, key1);
      await expect(cryptoService.decryptMessage(ciphertext, key2, nonce)).rejects.toThrow();
    });

    it('should generate different ciphertext for same plaintext', async () => {
      const plaintext = 'test message';
      const key = PropertyTesting.randomBytes(32);
      const result1 = await cryptoService.encryptMessage(plaintext, key);
      const result2 = await cryptoService.encryptMessage(plaintext, key);
      expect(result1.ciphertext).not.toEqual(result2.ciphertext);
      expect(result1.nonce).not.toEqual(result2.nonce);
    });
  });

  describe('Key Derivation', () => {
    it('HKDF should be deterministic', async () => {
      const secret = PropertyTesting.randomBytes(32);
      const salt = PropertyTesting.randomBytes(16);
      const info = 'test-info';
      const derived1 = await cryptoService.hkdf(secret, salt, info);
      const derived2 = await cryptoService.hkdf(secret, salt, info);
      expect(derived1).toEqual(derived2);
    });

    it('HKDF should produce different output for different inputs', async () => {
      const secret1 = PropertyTesting.randomBytes(32);
      const secret2 = PropertyTesting.randomBytes(32);
      const salt = PropertyTesting.randomBytes(16);
      const info = 'test-info';
      const derived1 = await cryptoService.hkdf(secret1, salt, info);
      const derived2 = await cryptoService.hkdf(secret2, salt, info);
      expect(derived1).not.toEqual(derived2);
    });
  });

  describe('Double Ratchet', () => {
    it('should initialize session state', async () => {
      const sharedSecret = PropertyTesting.randomBytes(32);
      const session = await cryptoService.initializeSession(sharedSecret);
      expect(session.sessionId).toBeDefined();
      expect(session.rootKey).toBeDefined();
      expect(session.sendingChain).toBeDefined();
      expect(session.sendingChain.messageNumber).toBe(0);
    });

    it('chain advancement should increment message number', async () => {
      const chainState = {
        chainKey: PropertyTesting.randomBytes(32),
        messageNumber: 5
      };
      const { newChainState } = await cryptoService.advanceChain(chainState);
      expect(newChainState.messageNumber).toBe(6);
      expect(newChainState.chainKey).not.toEqual(chainState.chainKey);
    });
  });

  describe('Hash Function', () => {
    it('hash function should be deterministic', async () => {
      await PropertyTesting.forAll(
        () => PropertyTesting.randomString(),
        async (input: string) => {
          const hash1 = await cryptoService.hash(input);
          const hash2 = await cryptoService.hash(input);
          return hash1 === hash2;
        },
        20
      );
    });

    it('hash function should produce different outputs for different inputs', async () => {
      const input1 = 'message1';
      const input2 = 'message2';
      const hash1 = await cryptoService.hash(input1);
      const hash2 = await cryptoService.hash(input2);
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('Random Number Generation', () => {
    it('random bytes should be different each time', async () => {
      const bytes1 = cryptoService.generateRandomBytes(32);
      const bytes2 = cryptoService.generateRandomBytes(32);
      expect(bytes1).not.toEqual(bytes2);
    });

    it('random bytes should have correct length encoding', async () => {
      for (const length of [16, 32, 64]) {
        const bytes = cryptoService.generateRandomBytes(length);
        const expectedLength = Math.ceil((length * 4) / 3);
        expect(Math.abs(bytes.length - expectedLength)).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Cryptographic Invariants', () => {
    it('encryption should satisfy semantic security', async () => {
      const plaintext = 'identical message';
      const key = PropertyTesting.randomBytes(32);
      const results = await Promise.all([
        cryptoService.encryptMessage(plaintext, key),
        cryptoService.encryptMessage(plaintext, key),
        cryptoService.encryptMessage(plaintext, key)
      ]);
      const ciphertexts = results.map(r => r.ciphertext);
      const nonces = results.map(r => r.nonce);
      expect(new Set(ciphertexts).size).toBe(3);
      expect(new Set(nonces).size).toBe(3);
    });

    it('key derivation should satisfy key independence', async () => {
      const masterKey = PropertyTesting.randomBytes(32);
      const salt = PropertyTesting.randomBytes(16);
      const key1 = await cryptoService.hkdf(masterKey, salt, 'purpose-1');
      const key2 = await cryptoService.hkdf(masterKey, salt, 'purpose-2');
      const key3 = await cryptoCService.hkdf(masterKey, salt, 'purpose-3');
      const keys = [key1, key2, key3];
      expect(new Set(keys).size).toBe(3);
    });
  });
});