/**
 * Social Service
 * Handles stories, posts, comments, and follows
 */

import { ID, Query } from 'appwrite';
import { databases } from '../config/client';
import { DATABASE_IDS, SOCIAL_COLLECTIONS } from '../config/constants';
import type { Stories, StoryViews, Posts, PostReactions, Comments, Follows } from '@/types/appwrite';

export class SocialService {
  private readonly databaseId = DATABASE_IDS.SOCIAL;

  /**
   * Create a story
   */
  async createStory(data: Partial<Stories>): Promise<Stories> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    return await databases.createRow<Stories>(
      this.databaseId,
      SOCIAL_COLLECTIONS.STORIES,
      ID.unique(),
      {
        ...data,
        viewCount: 0,
        reactionCount: 0,
        replyCount: 0,
        shareCount: 0,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Get user's stories
   */
  async getUserStories(userId: string): Promise<Stories[]> {
    try {
      const response = await databases.listRows<Stories>(
        this.databaseId,
        SOCIAL_COLLECTIONS.STORIES,
        [
          Query.equal('userId', userId),
          Query.greaterThan('expiresAt', new Date().toISOString()),
          Query.orderDesc('createdAt'),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting user stories:', error);
      return [];
    }
  }

  /**
   * Record story view
   */
  async viewStory(storyId: string, viewerId: string): Promise<void> {
    try {
      // Check if already viewed
      const existing = await databases.listRows<StoryViews>(
        this.databaseId,
        SOCIAL_COLLECTIONS.STORY_VIEWS,
        [
          Query.equal('storyId', storyId),
          Query.equal('viewerId', viewerId),
          Query.limit(1),
        ]
      );

      if (existing.rows.length > 0) return;

      // Create view record
      await databases.createRow<StoryViews>(
        this.databaseId,
        SOCIAL_COLLECTIONS.STORY_VIEWS,
        ID.unique(),
        {
          storyId,
          viewerId,
          watchDuration: 0,
          completedView: false,
          viewedAt: new Date().toISOString(),
        }
      );

      // Increment view count
      const story = await databases.getRow<Stories>(
        this.databaseId,
        SOCIAL_COLLECTIONS.STORIES,
        storyId
      );

      await databases.updateRow(
        this.databaseId,
        SOCIAL_COLLECTIONS.STORIES,
        storyId,
        {
          viewCount: (story.viewCount || 0) + 1,
          viewerIds: [...(story.viewerIds || []), viewerId],
        }
      );
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  }

  /**
   * Create a post
   */
  async createPost(data: Partial<Posts>): Promise<Posts> {
    return await databases.createRow<Posts>(
      this.databaseId,
      SOCIAL_COLLECTIONS.POSTS,
      ID.unique(),
      {
        ...data,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Get feed posts
   */
  async getFeedPosts(limit = 20, offset = 0): Promise<Posts[]> {
    try {
      const response = await databases.listRows<Posts>(
        this.databaseId,
        SOCIAL_COLLECTIONS.POSTS,
        [
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting feed posts:', error);
      return [];
    }
  }

  /**
   * Get user posts
   */
  async getUserPosts(userId: string, limit = 20): Promise<Posts[]> {
    try {
      const response = await databases.listRows<Posts>(
        this.databaseId,
        SOCIAL_COLLECTIONS.POSTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  /**
   * React to post
   */
  async reactToPost(postId: string, userId: string, reaction: string): Promise<void> {
    try {
      // Check if already reacted
      const existing = await databases.listRows<PostReactions>(
        this.databaseId,
        SOCIAL_COLLECTIONS.POST_REACTIONS,
        [
          Query.equal('postId', postId),
          Query.equal('userId', userId),
          Query.limit(1),
        ]
      );

      if (existing.rows.length > 0) {
        // Update reaction
        await databases.updateRow(
          this.databaseId,
          SOCIAL_COLLECTIONS.POST_REACTIONS,
          existing.rows[0].$id,
          { reaction }
        );
        return;
      }

      // Create reaction
      await databases.createRow<PostReactions>(
        this.databaseId,
        SOCIAL_COLLECTIONS.POST_REACTIONS,
        ID.unique(),
        {
          postId,
          userId,
          reaction,
          createdAt: new Date().toISOString(),
        }
      );

      // Increment like count
      const post = await databases.getRow<Posts>(
        this.databaseId,
        SOCIAL_COLLECTIONS.POSTS,
        postId
      );

      await databases.updateRow(
        this.databaseId,
        SOCIAL_COLLECTIONS.POSTS,
        postId,
        {
          likeCount: (post.likeCount || 0) + 1,
        }
      );
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  }

  /**
   * Add comment to post
   */
  async addComment(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<Comments> {
    const comment = await databases.createRow<Comments>(
      this.databaseId,
      SOCIAL_COLLECTIONS.COMMENTS,
      ID.unique(),
      {
        postId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
        mentions: [],
        likeCount: 0,
        replyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    // Increment post comment count
    const post = await databases.getRow<Posts>(
      this.databaseId,
      SOCIAL_COLLECTIONS.POSTS,
      postId
    );

    await databases.updateRow(
      this.databaseId,
      SOCIAL_COLLECTIONS.POSTS,
      postId,
      {
        commentCount: (post.commentCount || 0) + 1,
      }
    );

    return comment;
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<Follows> {
    return await databases.createRow<Follows>(
      this.databaseId,
      SOCIAL_COLLECTIONS.FOLLOWS,
      ID.unique(),
      {
        followerId,
        followingId,
        status: 'accepted',
        isCloseFriend: false,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follows = await databases.listRows<Follows>(
      this.databaseId,
      SOCIAL_COLLECTIONS.FOLLOWS,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.limit(1),
      ]
    );

    if (follows.rows.length > 0) {
      await databases.deleteRow(
        this.databaseId,
        SOCIAL_COLLECTIONS.FOLLOWS,
        follows.rows[0].$id
      );
    }
  }

  /**
   * Get followers
   */
  async getFollowers(userId: string, limit = 50): Promise<Follows[]> {
    try {
      const response = await databases.listRows<Follows>(
        this.databaseId,
        SOCIAL_COLLECTIONS.FOLLOWS,
        [
          Query.equal('followingId', userId),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  /**
   * Get following
   */
  async getFollowing(userId: string, limit = 50): Promise<Follows[]> {
    try {
      const response = await databases.listRows<Follows>(
        this.databaseId,
        SOCIAL_COLLECTIONS.FOLLOWS,
        [
          Query.equal('followerId', userId),
          Query.limit(limit),
        ]
      );
      return response.rows;
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }
}

export const socialService = new SocialService();
