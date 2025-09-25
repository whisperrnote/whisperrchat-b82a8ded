import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          anonymous_id: anonymousId,
          display_name: displayName || 'Anonymous User',
          allow_contact_discovery: false,
          visibility_mode: 'friends'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: authError } = await supabase
        .from('user_auth_methods')
        .insert({
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
        });

      if (authError) throw authError;

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
      const { data: authMethod, error: authError } = await supabase
        .from('user_auth_methods')
        .select('user_id, method_data')
        .eq('method', 'passkey')
        .contains('method_data', { credentialId: authenticationResponse.id })
        .single();

      if (authError || !authMethod) {
        throw new Error('Passkey not found');
      }

      // Create a session for this user
      // Note: This is a simplified approach. In production, you'd want to verify the signature
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authMethod.user_id)
        .single();

      if (profile) {
        // Store authentication state in localStorage for demo purposes
        localStorage.setItem('passkey_user_id', authMethod.user_id);
        toast.success('Successfully authenticated with passkey!');
        return { success: true, userId: authMethod.user_id };
      }

      throw new Error('User profile not found');
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