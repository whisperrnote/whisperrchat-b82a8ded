import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [authService] = useState(() => new AuthService());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [email, setEmail] = useState('');
  

  const handleWalletAuth = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.loginWithWallet(email);
      
      if (result.success && result.user) {
        onSuccess();
        onOpenChange(false);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to TenChat</DialogTitle>
          <DialogDescription>
            Enter your email and choose your authentication method
          </DialogDescription>
        </DialogHeader>

        {import.meta.env.DEV && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
            <strong className="text-amber-800 dark:text-amber-200">ℹ️ Note:</strong>
            <span className="text-amber-700 dark:text-amber-300"> Wallet authentication uses an Appwrite Function.</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleWalletAuth} 
              disabled={loading || !email} 
              variant="default" 
              className="w-full justify-start"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Continue with Web3 Wallet
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
