/**
 * Messaging Service
 * Handles conversations and messages in the chat database
 */

import { ID, Query } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, CHAT_COLLECTIONS } from '../config/constants';
import type { Models } from 'appwrite';

// Conversation interface
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

// Message interface
export interface Message extends Models.Document {
  conversationId: string;
  senderId: string;
  content: string;
  contentType: string;
  status?: string;
  createdAt?: string;
}

export class MessagingService {
  private readonly databaseId = DATABASE_IDS.CHAT;
  private readonly conversationsCollection = CHAT_COLLECTIONS.CONVERSATIONS;
  private readonly messagesCollection = CHAT_COLLECTIONS.MESSAGES;

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

  async getConversationMessages(conversationId: string, limit = 50): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.messagesCollection,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      );
      return response.documents as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
}

export const messagingService = new MessagingService();
