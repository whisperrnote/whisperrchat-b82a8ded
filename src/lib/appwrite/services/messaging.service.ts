/**
 * Messaging Service
 * Handles conversations and messages in the chat database
 */

import { ID, Query } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, CHAT_COLLECTIONS } from '../config/constants';
import type { Conversations, Messages, ContentType } from '@/types/appwrite.d';
import type { Models } from 'appwrite';

// Extended Conversation interface
export interface Conversation extends Models.Document {
  type: 'direct' | 'group' | 'channel' | 'broadcast' | 'community';
  name?: string;
  description?: string;
  creatorId: string;
  participantIds: string[];
  adminIds: string[];
  lastMessageAt?: string;
  lastMessageText?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended Message interface
export interface Message extends Models.Document {
  conversationId: string;
  senderId: string;
  content: string;
  contentType: ContentType | string;
  status?: string;
  metadata?: Record<string, any>;
  replyToId?: string;
  createdAt?: string;
}

export class MessagingService {
  private readonly databaseId = DATABASE_IDS.CHAT;
  private readonly conversationsCollection = CHAT_COLLECTIONS.CONVERSATIONS;
  private readonly messagesCollection = CHAT_COLLECTIONS.MESSAGES;

  /**
   * Create a new conversation
   */
  async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = await databases.createDocument(
      this.databaseId,
      this.conversationsCollection,
      ID.unique(),
      {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return conversation as Conversation;
  }

  /**
   * Get or create a direct conversation between two users
   */
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    try {
      // Search for existing direct conversation
      const response = await databases.listDocuments(
        this.databaseId,
        this.conversationsCollection,
        [
          Query.equal('type', 'direct'),
          Query.search('participantIds', userId1),
          Query.limit(100),
        ]
      );

      // Find conversation with both users
      const existing = response.documents.find((conv: any) => {
        const participants = conv.participantIds || [];
        return participants.includes(userId1) && participants.includes(userId2) && participants.length === 2;
      });

      if (existing) {
        return existing as Conversation;
      }

      // Create new conversation
      return await this.createConversation({
        type: 'direct',
        creatorId: userId1,
        participantIds: [userId1, userId2],
        adminIds: [userId1, userId2],
      });
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversation = await databases.getDocument(
        this.databaseId,
        this.conversationsCollection,
        conversationId
      );
      return conversation as Conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string, limit = 50): Promise<Conversation[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.conversationsCollection,
        [
          Query.search('participantIds', userId),
          Query.orderDesc('lastMessageAt'),
          Query.limit(limit),
        ]
      );
      return response.documents as Conversation[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(data: Partial<Message>): Promise<Message> {
    const message = await databases.createDocument(
      this.databaseId,
      this.messagesCollection,
      ID.unique(),
      {
        ...data,
        status: 'sent',
        createdAt: new Date().toISOString(),
      }
    );

    // Update conversation last message
    if (data.conversationId) {
      await databases.updateDocument(
        this.databaseId,
        this.conversationsCollection,
        data.conversationId,
        {
          lastMessageText: data.content,
          lastMessageAt: new Date().toISOString(),
        }
      );
    }

    return message as Message;
  }

  /**
   * Send a gift message
   */
  async sendGift(
    conversationId: string,
    senderId: string,
    giftType: string,
    amount: number,
    token?: string,
    message?: string
  ): Promise<Message> {
    return await this.sendMessage({
      conversationId,
      senderId,
      content: message || `Sent a ${giftType} gift`,
      contentType: 'token_gift',
      metadata: {
        giftType,
        amount,
        token: token || 'ETH',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Send a crypto transaction message
   */
  async sendCryptoTransaction(
    conversationId: string,
    senderId: string,
    txHash: string,
    amount: string,
    token: string,
    chain: string
  ): Promise<Message> {
    return await this.sendMessage({
      conversationId,
      senderId,
      content: `Sent ${amount} ${token}`,
      contentType: 'crypto_tx',
      metadata: {
        txHash,
        amount,
        token,
        chain,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.messagesCollection,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response.documents as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        this.databaseId,
        this.conversationsCollection,
        conversationId
      );
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      // This would typically update message read status
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }
}

export const messagingService = new MessagingService();
