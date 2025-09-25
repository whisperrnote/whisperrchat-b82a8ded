import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Temporary local key registry (Supabase removed; pending Appwrite integration)
import { toast } from 'sonner';
import {
  generateKeyPair,
  generateDeviceFingerprint,
  exportPublicKey,
  generateKeyFingerprint,
  SecureKeyStorage,
  generateSymmetricKey,
  encryptMessage,
  encryptSymmetricKey,
  decryptSymmetricKey,
  decryptMessage,
  importPublicKey
} from '@/lib/encryption';

interface DeviceKey {
  id: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  fingerprint: string;
}

interface EncryptedMessage {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  timestamp: Date;
}

export const useEncryption = () => {
  const { user } = useAuth();
  const [deviceKey, setDeviceKey] = useState<DeviceKey | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize device and encryption keys
  const initializeDevice = useCallback(async (password: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Check if device already exists
      // In-memory/localStorage device registry
      const devicesKey = `enc_devices_${user.id}`;
      const rawDevices = localStorage.getItem(devicesKey);
      let devices = rawDevices ? JSON.parse(rawDevices) : [];
      let existingDevice = devices.find((d: any) => d.device_fingerprint === deviceFingerprint);
      let deviceId = existingDevice?.id;
      if (!existingDevice) {
        deviceId = crypto.randomUUID();
        const newDevice = {
          id: deviceId,
          user_id: user.id,
            device_fingerprint: deviceFingerprint,
            device_name: `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`,
            device_type: 'web',
            is_trusted: true
        };
        devices.push(newDevice);
        localStorage.setItem(devicesKey, JSON.stringify(devices));
      }

      // Load or generate keys
      let keys = await SecureKeyStorage.loadDeviceKeys(password, deviceId);
      
      if (!keys) {
        // Generate new key pair
        const keyPair = await generateKeyPair();
        const publicKeyPem = await exportPublicKey(keyPair.publicKey);
        const fingerprint = await generateKeyFingerprint(keyPair.publicKey);

        // Store keys securely
        await SecureKeyStorage.storeDeviceKeys(
          keyPair.publicKey, 
          keyPair.privateKey, 
          password,
          deviceId
        );

        // Store public key and metadata in database
        const keyStoreKey = `enc_keys_${user.id}`;
        const rawKeys = localStorage.getItem(keyStoreKey);
        const keyEntries = rawKeys ? JSON.parse(rawKeys) : [];
        keyEntries.push({
          user_id: user.id,
          device_id: deviceId,
          public_key: publicKeyPem,
          encrypted_private_key: 'stored_locally',
          key_version: 1,
          is_active: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
        localStorage.setItem(keyStoreKey, JSON.stringify(keyEntries));
        keys = keyPair;
      }

      const fingerprint = await generateKeyFingerprint(keys.publicKey);
      
      setDeviceKey({
        id: deviceId,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        fingerprint
      });

      setIsInitialized(true);
      toast.success('Device encryption initialized successfully');
      return true;

    } catch (error: any) {
      console.error('Encryption initialization error:', error);
      toast.error(error.message || 'Failed to initialize encryption');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Encrypt and send message
  const sendEncryptedMessage = useCallback(async (
    content: string,
    chatId: string,
    recipientIds: string[]
  ): Promise<boolean> => {
    if (!deviceKey || !user) return false;

    try {
      // Generate symmetric key for this message
      const messageKey = await generateSymmetricKey();
      
      // Encrypt message content
      const { encryptedContent, iv } = await encryptMessage(content, messageKey);
      
      // Get recipient public keys
      const keyStoreKey = `enc_keys_${user.id}`;
      const allKeys = localStorage.getItem(keyStoreKey);
      const keyEntries = allKeys ? JSON.parse(allKeys) : [];
      const recipientKeys = keyEntries.filter((k: any) => recipientIds.includes(k.user_id) && k.is_active);
      const messageId = crypto.randomUUID();
      const messageRecord = {
        id: messageId,
        sender_id: user.id,
        chat_id: chatId,
        encrypted_content: `${encryptedContent}:${iv}`,
        sender_key_fingerprint: deviceKey.fingerprint,
        type: 'text'
      };
      const msgStoreKey = `enc_messages_${chatId}`;
      const rawMsgs = localStorage.getItem(msgStoreKey);
      const msgs = rawMsgs ? JSON.parse(rawMsgs) : [];
      msgs.push(messageRecord);
      localStorage.setItem(msgStoreKey, JSON.stringify(msgs));
      const messageRecipients = await Promise.all(
        recipientKeys.map(async (recipientKey: any) => {
          const publicKey = await importPublicKey(recipientKey.public_key);
          const encryptedMessageKey = await encryptSymmetricKey(messageKey, publicKey);
          return {
            message_id: messageId,
            recipient_id: recipientKey.user_id,
            encrypted_message_key: encryptedMessageKey
          };
        })
      );
      localStorage.setItem(`enc_message_recipients_${messageId}`, JSON.stringify(messageRecipients));

      toast.success('Message sent securely');
      return true;

    } catch (error: any) {
      console.error('Message encryption error:', error);
      toast.error(error.message || 'Failed to send encrypted message');
      return false;
    }
  }, [deviceKey, user]);

  // Decrypt received message
  const decryptReceivedMessage = useCallback(async (
    messageId: string,
    encryptedContent: string
  ): Promise<string | null> => {
    if (!deviceKey || !user) return null;

    try {
      // Get encrypted message key for this user
      const recRaw = localStorage.getItem(`enc_message_recipients_${messageId}`);
      if (!recRaw) throw new Error('No recipients stored');
      const recipients = JSON.parse(recRaw);
      const messageRecipient = recipients.find((r: any) => r.recipient_id === user.id);
      if (!messageRecipient) throw new Error('Recipient key not found');
      const messageKey = await decryptSymmetricKey(
        messageRecipient.encrypted_message_key,
        deviceKey.privateKey
      );

      // Parse encrypted content and IV
      const [content, iv] = encryptedContent.split(':');
      
      // Decrypt message
      const decryptedContent = await decryptMessage(content, iv, messageKey);
      
      return decryptedContent;

    } catch (error: any) {
      console.error('Message decryption error:', error);
      return null;
    }
  }, [deviceKey, user]);

  // Get chat members' public keys
  const getChatMemberKeys = useCallback(async (chatId: string): Promise<{
    userId: string;
    publicKey: string;
    fingerprint: string;
  }[]> => {
    try {
      // Demo: aggregate keys across all users (no membership filtering)
      const keys: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (k.startsWith('enc_keys_')) {
          const arr = JSON.parse(localStorage.getItem(k)!);
            arr.filter((r: any) => r.is_active).forEach((r: any) => keys.push(r));
        }
      }

      return await Promise.all(
        keys.map(async (key) => {
          const publicKey = await importPublicKey(key.public_key);
          const fingerprint = await generateKeyFingerprint(publicKey);
          
          return {
            userId: key.user_id,
            publicKey: key.public_key,
            fingerprint
          };
        })
      );

    } catch (error) {
      console.error('Error getting chat member keys:', error);
      return [];
    }
  }, []);

  // Rotate device keys (for forward secrecy)
  const rotateDeviceKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!deviceKey || !user) return false;

    try {
      setLoading(true);
      
      // Generate new key pair
      const newKeyPair = await generateKeyPair();
      const publicKeyPem = await exportPublicKey(newKeyPair.publicKey);
      const fingerprint = await generateKeyFingerprint(newKeyPair.publicKey);

      // Deactivate old key
      const keyStoreKey = `enc_keys_${user.id}`;
      const rawKeys = localStorage.getItem(keyStoreKey);
      const keyEntries = rawKeys ? JSON.parse(rawKeys) : [];
      keyEntries.forEach((k: any) => { if (k.device_id === deviceKey.id) k.is_active = false; });
      keyEntries.push({
        user_id: user.id,
        device_id: deviceKey.id,
        public_key: publicKeyPem,
        encrypted_private_key: 'stored_locally',
        key_version: 2,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      localStorage.setItem(keyStoreKey, JSON.stringify(keyEntries));

      // Update local storage
      await SecureKeyStorage.storeDeviceKeys(
        newKeyPair.publicKey,
        newKeyPair.privateKey,
        password,
        deviceKey.id
      );

      setDeviceKey({
        ...deviceKey,
        publicKey: newKeyPair.publicKey,
        privateKey: newKeyPair.privateKey,
        fingerprint
      });

      toast.success('Device keys rotated successfully');
      return true;

    } catch (error: any) {
      console.error('Key rotation error:', error);
      toast.error(error.message || 'Failed to rotate keys');
      return false;
    } finally {
      setLoading(false);
    }
  }, [deviceKey, user]);

  return {
    deviceKey,
    isInitialized,
    loading,
    initializeDevice,
    sendEncryptedMessage,
    decryptReceivedMessage,
    getChatMemberKeys,
    rotateDeviceKeys
  };
};