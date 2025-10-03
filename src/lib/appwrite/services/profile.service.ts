/**
 * Profile Service
 * Handles user profile operations
 */

import { ID, Query, type Models } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';
import type { Profiles } from '@/types/appwrite';

export class ProfileService {
  private readonly databaseId = DATABASE_IDS.MAIN;
  private readonly collectionId = MAIN_COLLECTIONS.PROFILES;

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<Profiles | null> {
    try {
      const response = await databases.listRows<Profiles>(
        this.databaseId,
        this.collectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      );
      return response.rows[0] || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Get profile by document ID
   */
  async getProfileById(id: string): Promise<Profiles | null> {
    try {
      return await databases.getRow<Profiles>(
        this.databaseId,
        this.collectionId,
        id
      );
    } catch (error) {
      console.error('Error getting profile by ID:', error);
      return null;
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(userId: string, data: Partial<Profiles>): Promise<Profiles> {
    return await databases.createRow<Profiles>(
      this.databaseId,
      this.collectionId,
      ID.unique(),
      {
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Update profile
   */
  async updateProfile(documentId: string, data: Partial<Profiles>): Promise<Profiles> {
    return await databases.updateRow<Profiles>(
      this.databaseId,
      this.collectionId,
      documentId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(documentId: string, isOnline: boolean): Promise<Profiles> {
    return await this.updateProfile(documentId, {
      isOnline,
      lastSeen: new Date().toISOString(),
    });
  }

  /**
   * Search profiles by username
   */
  async searchProfiles(username: string, limit = 10): Promise<Profiles[]> {
    try {
      const response = await databases.listRows<Profiles>(
        this.databaseId,
        this.collectionId,
        [Query.search('username', username), Query.limit(limit)]
      );
      return response.rows;
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  /**
   * Get online users
   */
  async getOnlineUsers(limit = 50): Promise<Profiles[]> {
    try {
      const response = await databases.listRows<Profiles>(
        this.databaseId,
        this.collectionId,
        [Query.equal('isOnline', true), Query.limit(limit)]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  /**
   * Update user XP and level
   */
  async addXP(documentId: string, xpToAdd: number): Promise<Profiles> {
    const profile = await this.getProfileById(documentId);
    if (!profile) throw new Error('Profile not found');

    const newXP = (profile.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 1000) + 1; // Simple leveling: 1000 XP per level

    return await this.updateProfile(documentId, {
      xp: newXP,
      level: newLevel,
    });
  }

  /**
   * Update streak
   */
  async updateStreak(documentId: string): Promise<Profiles> {
    const profile = await this.getProfileById(documentId);
    if (!profile) throw new Error('Profile not found');

    // Logic for streak calculation would go here
    const newStreak = (profile.streakDays || 0) + 1;

    return await this.updateProfile(documentId, {
      streakDays: newStreak,
    });
  }

  /**
   * Add badge to user
   */
  async addBadge(documentId: string, badgeId: string): Promise<Profiles> {
    const profile = await this.getProfileById(documentId);
    if (!profile) throw new Error('Profile not found');

    const badges = profile.badges || [];
    if (badges.includes(badgeId)) return profile;

    return await this.updateProfile(documentId, {
      badges: [...badges, badgeId],
    });
  }

  /**
   * Delete profile
   */
  async deleteProfile(documentId: string): Promise<void> {
    await databases.deleteRow(
      this.databaseId,
      this.collectionId,
      documentId
    );
  }
}

export const profileService = new ProfileService();
