/**
 * Messaging Service
 * Handles conversations and messages
 */

import { ID, Query, type Models } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';
import type { Conversations, Messages } from '@/types/appwrite';

export class MessagingService {
  private readonly databaseId = DATABASE_IDS.MAIN;
  private readonly conversationsCollection = MAIN_COLLECTIONS.CONVERSATIONS;
  private readonly messagesCollection = MAIN_COLLECTIONS.MESSAGES;

  /**
   * Create a new conversation
   */
  async createConversation(data: Partial<Conversations>): Promise<Conversations> {
    return await databases.createRow<Conversations>(
      this.databaseId,
      this.conversationsCollection,
      ID.unique(),
      {
        ...data,
        participantCount: data.participantIds?.length || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversations | null> {
    try {
      return await databases.getRow<Conversations>(
        this.databaseId,
        this.conversationsCollection,
        conversationId
      );
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string, limit = 50): Promise<Conversations[]> {
    try {
      const response = await databases.listRows<Conversations>(
        this.databaseId,
        this.conversationsCollection,
        [
          Query.search('participantIds', userId),
          Query.orderDesc('lastMessageAt'),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Update conversation
   */
  async updateConversation(
    conversationId: string,
    data: Partial<Conversations>
  ): Promise<Conversations> {
    return await databases.updateRow<Conversations>(
      this.databaseId,
      this.conversationsCollection,
      conversationId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Send a message
   */
  async sendMessage(data: Partial<Messages>): Promise<Messages> {
    const message = await databases.createRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      ID.unique(),
      {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    // Update conversation with last message
    if (data.conversationId) {
      await this.updateConversation(data.conversationId, {
        lastMessageId: message.$id,
        lastMessageText: data.plainText || '',
        lastMessageAt: message.createdAt,
        lastMessageSenderId: data.senderId,
      });
    }

    return message;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Messages[]> {
    try {
      const response = await databases.listRows<Messages>(
        this.databaseId,
        this.messagesCollection,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Update message status (read, delivered)
   */
  async updateMessageStatus(
    messageId: string,
    status: string,
    userId?: string
  ): Promise<Messages> {
    const message = await databases.getRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId
    );

    const updates: Partial<Messages> = { status };

    if (userId) {
      if (status === 'read') {
        updates.readBy = [...(message.readBy || []), userId];
      } else if (status === 'delivered') {
        updates.deliveredTo = [...(message.deliveredTo || []), userId];
      }
    }

    return await databases.updateRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId,
      updates
    );
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<Messages> {
    const message = await databases.getRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId
    );

    return await databases.updateRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId,
      {
        deletedFor: [...(message.deletedFor || []), userId],
        deletedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<Messages> {
    const message = await databases.getRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId
    );

    const reactions = message.reactions ? JSON.parse(message.reactions) : {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    return await databases.updateRow<Messages>(
      this.databaseId,
      this.messagesCollection,
      messageId,
      {
        reactions: JSON.stringify(reactions),
      }
    );
  }

  /**
   * Pin/unpin conversation
   */
  async togglePin(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isPinned = conversation.isPinned || [];
    const newIsPinned = isPinned.includes(userId)
      ? isPinned.filter(id => id !== userId)
      : [...isPinned, userId];

    return await this.updateConversation(conversationId, {
      isPinned: newIsPinned,
    });
  }

  /**
   * Mute/unmute conversation
   */
  async toggleMute(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isMuted = conversation.isMuted || [];
    const newIsMuted = isMuted.includes(userId)
      ? isMuted.filter(id => id !== userId)
      : [...isMuted, userId];

    return await this.updateConversation(conversationId, {
      isMuted: newIsMuted,
    });
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const unreadCount = conversation.unreadCount 
      ? JSON.parse(conversation.unreadCount) 
      : {};
    
    unreadCount[userId] = 0;

    return await this.updateConversation(conversationId, {
      unreadCount: JSON.stringify(unreadCount),
    });
  }

  /**
   * Search messages
   */
  async searchMessages(
    conversationId: string,
    query: string,
    limit = 20
  ): Promise<Messages[]> {
    try {
      const response = await databases.listRows<Messages>(
        this.databaseId,
        this.messagesCollection,
        [
          Query.equal('conversationId', conversationId),
          Query.search('plainText', query),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }
}

export const messagingService = new MessagingService();
