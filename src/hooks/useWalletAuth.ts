import { useState } from 'react';
import { createPublicClient, http, verifyMessage } from 'viem';
import { mainnet } from 'viem/chains';
// Supabase removed; will integrate with Appwrite or backend later
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWalletAuth = () => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      setConnected(true);
      return accounts[0];
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithWallet = async (displayName?: string) => {
    setLoading(true);
    try {
      const address = await connectWallet();
      if (!address) return { success: false };

      // Create a message to sign
      const message = `Sign in to Whisperrchat\nAddress: ${address}\nNonce: ${Date.now()}`;
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Verify signature (simplified for demo)
      const isValid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature,
      });

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Check if user already exists
      const existingRaw = localStorage.getItem('wallet_auth');
      let userId: string;
      if (existingRaw) {
        const existing = JSON.parse(existingRaw);
        if (existing.address === address.toLowerCase()) {
          userId = existing.user_id;
          toast.success('Welcome back!');
        } else {
          userId = crypto.randomUUID();
        }
      } else {
        userId = crypto.randomUUID();
        toast.success('Wallet registered successfully!');
      }
      const walletAuth = {
        user_id: userId,
        method: 'wallet_connect',
        address: address.toLowerCase(),
        chainId: await window.ethereum.request({ method: 'eth_chainId' }),
        signature,
        message,
        verified: true,
        is_primary: true
      };
      localStorage.setItem('wallet_auth', JSON.stringify(walletAuth));

      // Store authentication state
      localStorage.setItem('wallet_user_id', userId);
      localStorage.setItem('wallet_address', address);
      
      return { success: true, userId, address };
    } catch (error: any) {
      console.error('Wallet sign in error:', error);
      toast.error(error.message || 'Failed to sign in with wallet');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    localStorage.removeItem('wallet_user_id');
    localStorage.removeItem('wallet_address');
    toast.success('Wallet disconnected');
  };

  return {
    connectWallet,
    signInWithWallet,
    disconnectWallet,
    loading,
    connected,
  };
};