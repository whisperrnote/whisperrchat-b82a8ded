import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound, Wallet } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

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
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpUserId, setOtpUserId] = useState<string | undefined>();

  const handleOTPAuth = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!otpSent) {
        const result = await authService.loginWithOTP({ email });
        if (result.success && result.requiresOTP) {
          setOtpSent(true);
          setOtpUserId(result.token);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await authService.loginWithOTP({ email, code: otp, userId: otpUserId });
        if (result.success && result.user) {
          onSuccess();
          onOpenChange(false);
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.loginWithPasskey(email);
      if (result.success && result.user) {
        onSuccess();
        onOpenChange(false);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAuth = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.loginWithWallet({ email });
      
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
            <strong className="text-amber-800 dark:text-amber-200">⚠️ MVP Notice:</strong>
            <span className="text-amber-700 dark:text-amber-300"> Email OTP is recommended. Passkey/Wallet auth are simplified for MVP (client-side only).</span>
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

          {otpSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP Code</Label>
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleOTPAuth} disabled={loading || otp.length !== 6} className="w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button variant="ghost" onClick={() => { setOtpSent(false); setOtp(''); }} className="w-full">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={handleOTPAuth} 
                disabled={loading || !email} 
                variant="default" 
                className="w-full justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Email OTP
              </Button>

              <Button 
                onClick={() => handlePasskeyAuth()} 
                disabled={loading || !email} 
                variant="outline" 
                className="w-full justify-start"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Continue with Passkey
              </Button>

              <Button 
                onClick={handleWalletAuth} 
                disabled={loading || !email} 
                variant="outline" 
                className="w-full justify-start"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Continue with Web3 Wallet
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2">
                New to passkeys? Click "Continue with Passkey" to register
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
