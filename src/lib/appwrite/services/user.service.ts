/**
 * User Service
 * Handles user data from the whisperrnote database
 */

import { Query } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, WHISPERRNOTE_COLLECTIONS } from '../config/constants';
import type { Models } from 'appwrite';

export interface User extends Models.Document {
  id: string;
  email?: string;
  name?: string;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class UserService {
  private readonly databaseId = DATABASE_IDS.WHISPERRNOTE;
  private readonly usersCollection = WHISPERRNOTE_COLLECTIONS.USERS;

  async getUser(userId: string): Promise<User | null> {
    try {
      const user = await databases.getDocument(
        this.databaseId,
        this.usersCollection,
        userId
      );
      return user as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollection,
        [Query.equal('email', email), Query.limit(1)]
      );
      return (response.documents[0] as User) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async searchUsers(searchTerm: string, limit = 20): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollection,
        [
          Query.search('name', searchTerm),
          Query.limit(limit),
        ]
      );
      return response.documents as User[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export const userService = new UserService();
