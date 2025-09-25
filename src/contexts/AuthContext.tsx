import React, { createContext, useContext, useEffect, useState } from 'react';
// Temporary placeholder types until Appwrite integration
interface User { id: string; email?: string; display_name?: string }
interface Session { user: User | null }
// Supabase removed; future Appwrite client will go here
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: load user from localStorage (pre-Appwrite)
    const stored = localStorage.getItem('demo_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setSession({ user: parsed });
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    try {
      localStorage.removeItem('demo_user');
      setUser(null);
      setSession({ user: null });
      toast.success('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};