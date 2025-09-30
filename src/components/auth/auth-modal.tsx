import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, KeyRound, Wallet } from 'lucide-react';
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

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpUserId, setOtpUserId] = useState<string | undefined>();

  const [email, setEmail] = useState('');
  const [isPasskeyRegistration, setIsPasskeyRegistration] = useState(false);

  const [walletAddress, setWalletAddress] = useState('');
  const [signatureMessage, setSignatureMessage] = useState('');
  const [needsSignature, setNeedsSignature] = useState(false);

  const handleOTPAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (!otpSent) {
        const result = await authService.loginWithOTP({ phone: phoneNumber });
        if (result.success && result.requiresOTP) {
          setOtpSent(true);
          setOtpUserId(result.token);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await authService.loginWithOTP({ phone: phoneNumber, code: otp, userId: otpUserId });
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
    setLoading(true);
    setError('');

    try {
      const result = await authService.loginWithPasskey(email, isPasskeyRegistration);
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
    setLoading(true);
    setError('');

    try {
      if (!needsSignature) {
        const result = await authService.loginWithWallet(walletAddress);
        if (result.success && result.requiresSignature && result.message) {
          setNeedsSignature(true);
          setSignatureMessage(result.message);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        const signature = await signMessage(signatureMessage);
        const result = await authService.loginWithWallet(walletAddress, signature);
        if (result.success && result.user) {
          onSuccess();
          onOpenChange(false);
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      }) as string;
      return signature;
    }
    throw new Error('No Web3 wallet detected');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to WhisperChat</DialogTitle>
          <DialogDescription>
            Choose your preferred authentication method
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="otp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="otp">
              <Smartphone className="w-4 h-4 mr-2" />
              OTP
            </TabsTrigger>
            <TabsTrigger value="passkey">
              <KeyRound className="w-4 h-4 mr-2" />
              Passkey
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="otp" className="space-y-4">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleOTPAuth} disabled={loading || !phoneNumber} className="w-full">
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
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
                <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full">
                  Change Number
                </Button>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </TabsContent>

          <TabsContent value="passkey" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setIsPasskeyRegistration(false);
                  handlePasskeyAuth();
                }} 
                disabled={loading || !email} 
                className="flex-1"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
              <Button 
                onClick={() => {
                  setIsPasskeyRegistration(true);
                  handlePasskeyAuth();
                }} 
                disabled={loading || !email} 
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            {!needsSignature ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    type="text"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                <Button onClick={handleWalletAuth} disabled={loading || !walletAddress} className="w-full">
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Sign Message</Label>
                  <p className="text-sm text-muted-foreground">{signatureMessage}</p>
                </div>
                <Button onClick={handleWalletAuth} disabled={loading} className="w-full">
                  {loading ? 'Signing...' : 'Sign & Authenticate'}
                </Button>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
