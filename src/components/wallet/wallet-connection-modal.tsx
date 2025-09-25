import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Wallet, Shield, Zap, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletType: string) => void;
}

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension',
    icon: '🦊',
    status: 'available',
    popular: true,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with mobile wallet',
    icon: '📱',
    status: 'available',
    popular: false,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: '🔷',
    status: 'available',
    popular: true,
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Hardware wallet connection',
    icon: '🔒',
    status: 'available',
    popular: false,
  },
  {
    id: 'trezor',
    name: 'Trezor',
    description: 'Hardware wallet connection',
    icon: '🛡️',
    status: 'available',
    popular: false,
  },
];

const MOCK_CONNECTED_WALLET = {
  address: '0x742d35cc6cf6fc3e8a8c4e3c7a3e6c',
  ens: 'alice.eth',
  balance: '12.847',
  network: 'Ethereum',
};

export function WalletConnectionModal({ open, onOpenChange, onConnect }: WalletConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletId);
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectedWallet(MOCK_CONNECTED_WALLET);
      setIsConnecting(false);
      onConnect(walletId);
      
      // Close modal after successful connection
      setTimeout(() => {
        onOpenChange(false);
        setConnectedWallet(null);
        setSelectedWallet(null);
      }, 2000);
    }, 2000);
  };

  const copyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet.address);
    }
  };

  if (connectedWallet) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-black via-zinc-900 to-violet-900/20 border-violet-500/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              Wallet Connected Successfully
            </DialogTitle>
            <DialogDescription className="text-zinc-300">
              Your wallet is now connected and ready to use with TenChat.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 bg-gradient-to-r from-violet-500 to-purple-600">
                  <span className="text-white font-bold">
                    {connectedWallet.ens ? connectedWallet.ens[0].toUpperCase() : 'W'}
                  </span>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">
                      {connectedWallet.ens || 'Your Wallet'}
                    </span>
                    <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <span className="text-xs text-green-400 font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm font-mono">
                      {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 rounded hover:bg-zinc-800 transition-colors"
                    >
                      <Copy className="h-3 w-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-900/50">
                  <div className="text-zinc-400 text-xs mb-1">Balance</div>
                  <div className="text-white font-semibold">{connectedWallet.balance} ETH</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-900/50">
                  <div className="text-zinc-400 text-xs mb-1">Network</div>
                  <div className="text-white font-semibold">{connectedWallet.network}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Secure Connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">Ready for Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-black via-zinc-900 to-violet-900/20 border-violet-500/20 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            Connect your crypto wallet to start sending secure, encrypted messages and gifts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Why Connect?</span>
            </div>
            <div className="space-y-1 text-xs text-zinc-400">
              <div>• Send and receive crypto gifts</div>
              <div>• Enhanced message encryption</div>
              <div>• Blockchain-anchored conversations</div>
              <div>• Identity verification via ENS</div>
            </div>
          </div>

          <div className="space-y-3">
            {WALLET_OPTIONS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedWallet === wallet.id && isConnecting
                    ? 'border-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-600/20'
                    : 'border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:border-violet-500/50 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-600/10'
                } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{wallet.name}</span>
                      {wallet.popular && (
                        <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                          <span className="text-xs text-yellow-400 font-medium">Popular</span>
                        </div>
                      )}
                    </div>
                    <span className="text-zinc-400 text-sm">{wallet.description}</span>
                  </div>
                  {selectedWallet === wallet.id && isConnecting ? (
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ExternalLink className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Security Notice</span>
            </div>
            <p className="text-xs text-zinc-400">
              TenChat never stores your private keys. Your wallet remains in your control at all times.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}