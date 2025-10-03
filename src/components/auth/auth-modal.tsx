import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAppwrite } from '@/contexts/AppwriteContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type LoadingState = 'idle' | 'connecting' | 'signing' | 'authenticating';

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { loginWithWallet, forceRefreshAuth } = useAppwrite();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');

  const handleWalletConnect = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');

    try {
      setLoadingState('connecting');
      
      // Check MetaMask
      if (!window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask browser extension.');
        setLoadingState('idle');
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account selected');
      }

      const address = accounts[0];

      setLoadingState('signing');

      // Generate authentication message
      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      });

      setLoadingState('authenticating');

      // Authenticate with backend
      await loginWithWallet(email, address, signature, message);
      
      // Force a refresh to ensure state is updated
      await forceRefreshAuth();
      
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const error = err as { code?: number; message?: string };
      console.error('Wallet connect error:', error);
      
      // Handle specific errors
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        setError('You cancelled the signature request. Please try again.');
      } else if (error.message?.includes('MetaMask')) {
        setError(error.message);
      } else if (error.message?.includes('session already exists')) {
        // Session already exists, just refresh
        console.log('Session exists, refreshing...');
        await forceRefreshAuth();
        onSuccess();
        onOpenChange(false);
      } else {
        setError(error?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoadingState('idle');
    }
  };

  const getButtonText = () => {
    switch (loadingState) {
      case 'connecting': return 'Connecting to wallet...';
      case 'signing': return 'Please sign the message...';
      case 'authenticating': return 'Authenticating...';
      default: return 'Connect Wallet';
    }
  };

  const isLoading = loadingState !== 'idle';

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-800"
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            Welcome to WhisperChat
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your wallet to get started. This is a Web3-first messaging platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading && email) {
                  handleWalletConnect();
                }
              }}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Your email is linked to your wallet for account recovery
            </p>
          </div>

          <Button 
            onClick={handleWalletConnect} 
            disabled={isLoading || !email} 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getButtonText()}
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {getButtonText()}
              </>
            )}
          </Button>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              {loadingState === 'connecting' && 'Opening MetaMask...'}
              {loadingState === 'signing' && 'Waiting for signature...'}
              {loadingState === 'authenticating' && 'Creating secure session...'}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-sm text-red-400 flex-1">{error}</p>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-gray-800">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5" />
              <p>No MetaMask? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Install it here</a></p>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5" />
              <p>Your wallet address will be your primary identity</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5" />
              <p>By continuing, you agree to our Terms & Privacy Policy</p>
            </div>
            
            {/* Debug: Check if there's an existing session */}
            {error && error.includes('session') && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await forceRefreshAuth();
                    onSuccess();
                    onOpenChange(false);
                  } catch (e) {
                    setError('Could not restore session. Please logout from Appwrite Console and try again.');
                  }
                }}
                className="w-full mt-2 bg-gray-800 hover:bg-gray-700 border-gray-700"
              >
                Try Restoring Session
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
