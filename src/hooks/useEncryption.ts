import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: existingDevice } = await supabase
        .from('user_devices')
        .select('id, device_fingerprint')
        .eq('user_id', user.id)
        .eq('device_fingerprint', deviceFingerprint)
        .single();

      let deviceId = existingDevice?.id;
      
      if (!existingDevice) {
        // Create new device
        const { data: newDevice, error: deviceError } = await supabase
          .from('user_devices')
          .insert({
            user_id: user.id,
            device_fingerprint: deviceFingerprint,
            device_name: `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`,
            device_type: 'web' as const,
            is_trusted: true
          })
          .select('id')
          .single();

        if (deviceError) throw deviceError;
        deviceId = newDevice.id;
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
        const { error: keyError } = await supabase
          .from('user_keys')
          .upsert({
            user_id: user.id,
            device_id: deviceId,
            public_key: publicKeyPem,
            encrypted_private_key: 'stored_locally', // We store encrypted private key locally
            key_version: 1,
            is_active: true,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          });

        if (keyError) throw keyError;
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
      const { data: recipientKeys, error: keysError } = await supabase
        .from('user_keys')
        .select('user_id, public_key, device_id')
        .in('user_id', recipientIds)
        .eq('is_active', true);

      if (keysError) throw keysError;

      // Create message record
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          chat_id: chatId,
          encrypted_content: `${encryptedContent}:${iv}`,
          sender_key_fingerprint: deviceKey.fingerprint,
          type: 'text'
        })
        .select('id')
        .single();

      if (messageError) throw messageError;

      // Encrypt message key for each recipient
      const messageRecipients = await Promise.all(
        recipientKeys.map(async (recipientKey) => {
          const publicKey = await importPublicKey(recipientKey.public_key);
          const encryptedMessageKey = await encryptSymmetricKey(messageKey, publicKey);
          
          return {
            message_id: message.id,
            recipient_id: recipientKey.user_id,
            encrypted_message_key: encryptedMessageKey
          };
        })
      );

      // Store encrypted keys for recipients
      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(messageRecipients);

      if (recipientsError) throw recipientsError;

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
      const { data: messageRecipient, error: recipientError } = await supabase
        .from('message_recipients')
        .select('encrypted_message_key')
        .eq('message_id', messageId)
        .eq('recipient_id', user.id)
        .single();

      if (recipientError) throw recipientError;

      // Decrypt the message key
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
      const { data: members, error: membersError } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId);

      if (membersError) throw membersError;

      const { data: keys, error: keysError } = await supabase
        .from('user_keys')
        .select('user_id, public_key')
        .in('user_id', members.map(m => m.user_id))
        .eq('is_active', true);

      if (keysError) throw keysError;

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
      await supabase
        .from('user_keys')
        .update({ is_active: false })
        .eq('device_id', deviceKey.id);

      // Store new key
      const { error: keyError } = await supabase
        .from('user_keys')
        .insert({
          user_id: user.id,
          device_id: deviceKey.id,
          public_key: publicKeyPem,
          encrypted_private_key: 'stored_locally',
          key_version: 2,
          is_active: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (keyError) throw keyError;

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