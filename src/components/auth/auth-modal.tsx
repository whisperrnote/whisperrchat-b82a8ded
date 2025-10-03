import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Mail, Lock } from 'lucide-react';
import { useAppwrite } from '@/contexts/AppwriteContext';
import { account } from '@/lib/appwrite/config/client';
import { ID } from 'appwrite';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { login } = useAppwrite();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create account
      await account.create(ID.unique(), email, password, name);
      
      // Auto login after signup
      await login(email, password);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome to WhisperChat</DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in or create an account to get started
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-gray-300">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-gray-300">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && email && password) {
                    handleLogin();
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button 
              onClick={handleLogin} 
              disabled={loading || !email || !password} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-gray-300">Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && email && password && name) {
                    handleSignup();
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <Button 
              onClick={handleSignup} 
              disabled={loading || !email || !password || !name} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
