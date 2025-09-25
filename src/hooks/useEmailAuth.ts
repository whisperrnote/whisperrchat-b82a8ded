import { useState } from 'react';
// Supabase removed; stubbed local auth pending Appwrite
import { toast } from 'sonner';

export const useEmailAuth = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      // Demo: store minimal user record locally
      const user = { id: crypto.randomUUID(), email, display_name: displayName || 'Anonymous User' };
      localStorage.setItem('demo_user', JSON.stringify(user));
      toast.success('Account created (local demo)');
      return { data: { user }, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Demo: accept any credentials if an account exists or create one
      let stored = localStorage.getItem('demo_user');
      if (!stored) {
        stored = JSON.stringify({ id: crypto.randomUUID(), email, display_name: email.split('@')[0] });
        localStorage.setItem('demo_user', stored);
      }
      const user = JSON.parse(stored);
      toast.success('Signed in (local demo)');
      return { data: { user }, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    loading,
  };
};