/**
 * Web3 Service
 * Handles wallets, NFTs, and crypto transactions
 */

import { ID, Query } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, WEB3_COLLECTIONS } from '../config/constants';
import type { Wallets, Nfts, CryptoTransactions, TokenGifts, TokenHoldings } from '@/types/appwrite.d';

export class Web3Service {
  private readonly databaseId = DATABASE_IDS.WEB3;

  // Wallet Management
  async connectWallet(userId: string, address: string, chain: string, walletType: string): Promise<Wallets> {
    return await databases.createRow<Wallets>(
      this.databaseId,
      WEB3_COLLECTIONS.WALLETS,
      ID.unique(),
      {
        userId,
        address,
        chain,
        walletType,
        isPrimary: false,
        isVerified: false,
        nftsCount: 0,
        addedAt: new Date().toISOString(),
      }
    );
  }

  async getUserWallets(userId: string): Promise<Wallets[]> {
    try {
      const response = await databases.listRows<Wallets>(
        this.databaseId,
        WEB3_COLLECTIONS.WALLETS,
        [Query.equal('userId', userId)]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      return [];
    }
  }

  async setPrimaryWallet(walletId: string, userId: string): Promise<void> {
    // Unset all other primary wallets
    const wallets = await this.getUserWallets(userId);
    for (const wallet of wallets) {
      if (wallet.isPrimary) {
        await databases.updateRow(
          this.databaseId,
          WEB3_COLLECTIONS.WALLETS,
          wallet.$id,
          { isPrimary: false }
        );
      }
    }

    // Set new primary
    await databases.updateRow(
      this.databaseId,
      WEB3_COLLECTIONS.WALLETS,
      walletId,
      { isPrimary: true }
    );
  }

  // NFT Management
  async addNFT(userId: string, nftData: Partial<Nfts>): Promise<Nfts> {
    return await databases.createRow<Nfts>(
      this.databaseId,
      WEB3_COLLECTIONS.NFTS,
      ID.unique(),
      {
        userId,
        ...nftData,
        isHidden: false,
        isProfilePicture: false,
        acquiredAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
      }
    );
  }

  async getUserNFTs(userId: string, limit = 50): Promise<Nfts[]> {
    try {
      const response = await databases.listRows<Nfts>(
        this.databaseId,
        WEB3_COLLECTIONS.NFTS,
        [
          Query.equal('userId', userId),
          Query.equal('isHidden', false),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  }

  async setNFTAsProfilePicture(nftId: string, userId: string): Promise<void> {
    // Unset all other profile pictures
    const nfts = await this.getUserNFTs(userId);
    for (const nft of nfts) {
      if (nft.isProfilePicture) {
        await databases.updateRow(
          this.databaseId,
          WEB3_COLLECTIONS.NFTS,
          nft.$id,
          { isProfilePicture: false }
        );
      }
    }

    // Set new profile picture
    await databases.updateRow(
      this.databaseId,
      WEB3_COLLECTIONS.NFTS,
      nftId,
      { isProfilePicture: true }
    );
  }

  // Transaction Tracking
  async recordTransaction(txData: Partial<CryptoTransactions>): Promise<CryptoTransactions> {
    return await databases.createRow<CryptoTransactions>(
      this.databaseId,
      WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
      ID.unique(),
      {
        ...txData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    );
  }

  async updateTransactionStatus(txId: string, status: string, blockNumber?: number): Promise<void> {
    await databases.updateRow(
      this.databaseId,
      WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
      txId,
      {
        status,
        blockNumber: blockNumber || null,
      }
    );
  }

  async getUserTransactions(userId: string, limit = 50): Promise<CryptoTransactions[]> {
    try {
      const response = await databases.listRows<CryptoTransactions>(
        this.databaseId,
        WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Token Gifting
  async createGift(giftData: Partial<TokenGifts>): Promise<TokenGifts> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    return await databases.createRow<TokenGifts>(
      this.databaseId,
      WEB3_COLLECTIONS.TOKEN_GIFTS,
      ID.unique(),
      {
        ...giftData,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      }
    );
  }

  async claimGift(giftId: string, claimTxHash: string): Promise<void> {
    await databases.updateRow(
      this.databaseId,
      WEB3_COLLECTIONS.TOKEN_GIFTS,
      giftId,
      {
        status: 'claimed',
        claimTxHash,
        claimedAt: new Date().toISOString(),
      }
    );
  }

  async getPendingGifts(userId: string): Promise<TokenGifts[]> {
    try {
      const response = await databases.listRows<TokenGifts>(
        this.databaseId,
        WEB3_COLLECTIONS.TOKEN_GIFTS,
        [
          Query.equal('recipientId', userId),
          Query.equal('status', 'pending'),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting pending gifts:', error);
      return [];
    }
  }

  // Token Holdings
  async updateHoldings(userId: string, holdingsData: Partial<TokenHoldings>): Promise<TokenHoldings> {
    // Try to find existing holding
    const existing = await databases.listRows<TokenHoldings>(
      this.databaseId,
      WEB3_COLLECTIONS.TOKEN_HOLDINGS,
      [
        Query.equal('userId', userId),
        Query.equal('chain', holdingsData.chain!),
        Query.equal('tokenAddress', holdingsData.tokenAddress!),
        Query.limit(1),
      ]
    );

    if (existing.rows.length > 0) {
      // Update existing
      return await databases.updateRow<TokenHoldings>(
        this.databaseId,
        WEB3_COLLECTIONS.TOKEN_HOLDINGS,
        existing.rows[0].$id,
        {
          ...holdingsData,
          lastSynced: new Date().toISOString(),
        }
      );
    }

    // Create new
    return await databases.createRow<TokenHoldings>(
      this.databaseId,
      WEB3_COLLECTIONS.TOKEN_HOLDINGS,
      ID.unique(),
      {
        userId,
        ...holdingsData,
        decimals: holdingsData.decimals || 18,
        lastSynced: new Date().toISOString(),
      }
    );
  }

  async getUserHoldings(userId: string, chain?: string): Promise<TokenHoldings[]> {
    try {
      const queries = [Query.equal('userId', userId)];
      if (chain) queries.push(Query.equal('chain', chain));

      const response = await databases.listRows<TokenHoldings>(
        this.databaseId,
        WEB3_COLLECTIONS.TOKEN_HOLDINGS,
        queries
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting holdings:', error);
      return [];
    }
  }
}

export const web3Service = new Web3Service();
