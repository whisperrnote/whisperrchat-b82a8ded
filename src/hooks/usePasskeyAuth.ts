import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
// Supabase removed; will integrate Appwrite or server later
import { toast } from 'sonner';

export const usePasskeyAuth = () => {
  const [loading, setLoading] = useState(false);

  const registerPasskey = async (email: string, displayName?: string) => {
    setLoading(true);
    try {
      // First create a user profile for passkey registration
      const anonymousId = crypto.randomUUID();
      
      // Generate registration options
      const registrationOptions = {
        optionsJSON: {
          rp: {
            name: "Whisperrchat",
            id: window.location.hostname,
          },
          user: {
            id: anonymousId,
            name: email,
            displayName: displayName || 'Anonymous User',
          },
          challenge: Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x => x.toString(16).padStart(2, '0')).join(''),
          pubKeyCredParams: [{ alg: -7, type: "public-key" as const }],
          authenticatorSelection: {
            authenticatorAttachment: "platform" as const,
            userVerification: "required" as const,
          },
        }
      };

      const registrationResponse = await startRegistration(registrationOptions);
      
      // Create user profile with generated UUID for id
      const userId = crypto.randomUUID();
      const profile = {
        id: userId,
        anonymous_id: anonymousId,
        display_name: displayName || 'Anonymous User'
      };
      const storedAuth = {
        user_id: profile.id,
        method: 'passkey',
        method_data: {
          credentialId: registrationResponse.id,
          publicKey: registrationResponse.response.publicKey,
          counter: 0,
          email: email
        },
        verified: true,
        is_primary: true
      };
      localStorage.setItem('passkey_profile', JSON.stringify(profile));
      localStorage.setItem('passkey_auth', JSON.stringify(storedAuth));
      toast.success('Passkey registered successfully!');
      return { success: true, userId: profile.id };
    } catch (error: any) {
      console.error('Passkey registration error:', error);
      toast.error(error.message || 'Failed to register passkey');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    setLoading(true);
    try {
      const authenticationOptions = {
        optionsJSON: {
          challenge: Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x => x.toString(16).padStart(2, '0')).join(''),
          timeout: 60000,
          userVerification: "required" as const,
        }
      };

      const authenticationResponse = await startAuthentication(authenticationOptions);
      
      // Find user by credential ID
      const storedAuthRaw = localStorage.getItem('passkey_auth');
      if (!storedAuthRaw) throw new Error('No passkey registered');
      const authMethod = JSON.parse(storedAuthRaw);
      if (authMethod.method_data.credentialId !== authenticationResponse.id) {
        throw new Error('Passkey not found');
      }
      const profileRaw = localStorage.getItem('passkey_profile');
      if (!profileRaw) throw new Error('User profile not found');
      const profile = JSON.parse(profileRaw);
      localStorage.setItem('passkey_user_id', authMethod.user_id);
      toast.success('Successfully authenticated with passkey!');
      return { success: true, userId: authMethod.user_id };
    } catch (error: any) {
      console.error('Passkey authentication error:', error);
      toast.error(error.message || 'Failed to authenticate with passkey');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerPasskey,
    authenticateWithPasskey,
    loading,
  };
};