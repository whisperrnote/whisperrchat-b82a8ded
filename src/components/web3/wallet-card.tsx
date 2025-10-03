/**
 * Wallet Card Component
 * Display wallet balance and quick actions
 */

import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Copy, Send, Gift, TrendingUp, Zap, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useWallets, useTokenHoldings, useTokenGifts } from '@/hooks';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  userId: string;
  className?: string;
}

export function WalletCard({ userId, className }: WalletCardProps) {
  const { wallets, primaryWallet, isLoading: walletsLoading } = useWallets(userId);
  const { totalValue, holdings, isLoading: holdingsLoading } = useTokenHoldings(userId);
  const { pendingGifts, hasPendingGifts } = useTokenGifts(userId);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (primaryWallet?.address) {
      navigator.clipboard.writeText(primaryWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (walletsLoading || holdingsLoading) {
    return (
      <Card className={cn("bg-gray-900 border-gray-800", className)}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-800 rounded w-1/3" />
            <div className="h-8 bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!primaryWallet) {
    return (
      <Card className={cn("bg-gray-900 border-gray-800", className)}>
        <CardContent className="p-4 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 text-sm mb-3">No wallet connected</p>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">
              {primaryWallet.walletType}
            </span>
            <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">
              {primaryWallet.chain}
            </Badge>
          </div>
          {hasPendingGifts && (
            <Badge className="bg-pink-500 text-white animate-pulse">
              {pendingGifts.length} Gift{pendingGifts.length !== 1 && 's'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Total Balance</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <Eye className="w-3 h-3 text-gray-400" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </Button>
          </div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? formatBalance(totalValue) : '••••••'}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
          <span className="text-sm text-gray-300 font-mono">
            {formatAddress(primaryWallet.address)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopyAddress}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </Button>
        </div>

        {/* Holdings */}
        {holdings.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-gray-400">Top Holdings</span>
            {holdings.slice(0, 3).map((holding, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-black/20 rounded"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  <span className="text-sm text-white font-medium">
                    {holding.tokenSymbol}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">
                    {parseFloat(holding.balance || '0').toFixed(4)}
                  </div>
                  {holding.usdPrice && (
                    <div className="text-xs text-gray-400">
                      ${(parseFloat(holding.balance || '0') * holding.usdPrice).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500 text-purple-300 hover:bg-purple-500/20 flex flex-col gap-1 h-auto py-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-xs">Send</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-pink-500 text-pink-300 hover:bg-pink-500/20 flex flex-col gap-1 h-auto py-2"
          >
            <Gift className="w-4 h-4" />
            <span className="text-xs">Gift</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/20 flex flex-col gap-1 h-auto py-2"
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs">Swap</span>
          </Button>
        </div>

        {/* Stats */}
        {wallets.length > 1 && (
          <div className="text-xs text-center text-gray-400 pt-2 border-t border-gray-800">
            {wallets.length} wallets connected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
