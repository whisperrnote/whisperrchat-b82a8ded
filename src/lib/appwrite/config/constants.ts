/**
 * Appwrite Configuration Constants
 * Auto-generated from appwrite.config.json
 */

// Database IDs
export const DATABASE_IDS = {
  MAIN: 'mainDB',
  SOCIAL: 'socialDB',
  WEB3: 'web3DB',
  CONTENT: 'contentDB',
  ANALYTICS: 'analyticsDB',
} as const;

// Collection IDs - Main Database
export const MAIN_COLLECTIONS = {
  PROFILES: 'profiles',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  MESSAGE_QUEUE: 'messageQueue',
  CONTACTS: 'contacts',
  TYPING_INDICATORS: 'typingIndicators',
  PRESENCE: 'presence',
} as const;

// Collection IDs - Social Database
export const SOCIAL_COLLECTIONS = {
  STORIES: 'stories',
  STORY_VIEWS: 'storyViews',
  POSTS: 'posts',
  POST_REACTIONS: 'postReactions',
  COMMENTS: 'comments',
  FOLLOWS: 'follows',
} as const;

// Collection IDs - Web3 Database
export const WEB3_COLLECTIONS = {
  WALLETS: 'wallets',
  NFTS: 'nfts',
  CRYPTO_TRANSACTIONS: 'cryptoTransactions',
  TOKEN_GIFTS: 'tokenGifts',
  CONTRACT_HOOKS: 'contractHooks',
  TOKEN_HOLDINGS: 'tokenHoldings',
} as const;

// Collection IDs - Content Database
export const CONTENT_COLLECTIONS = {
  STICKERS: 'stickers',
  STICKER_PACKS: 'stickerPacks',
  USER_STICKERS: 'userStickers',
  GIFS: 'gifs',
  POLLS: 'polls',
  AR_FILTERS: 'arFilters',
  MEDIA_LIBRARY: 'mediaLibrary',
} as const;

// Collection IDs - Analytics Database
export const ANALYTICS_COLLECTIONS = {
  USER_ACTIVITY: 'userActivity',
  NOTIFICATIONS: 'notifications',
  APP_ANALYTICS: 'appAnalytics',
  ERROR_LOGS: 'errorLogs',
} as const;

// Storage Bucket IDs
export const BUCKET_IDS = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  MESSAGES: 'messages',
  STORIES: 'stories',
  POSTS: 'posts',
  NFTS: 'nfts',
  STICKERS: 'stickers',
  FILTERS: 'filters',
  GIFS: 'gifs',
  VOICE: 'voice',
  VIDEO: 'video',
  DOCUMENTS: 'documents',
} as const;

// All Collections (for convenience)
export const COLLECTIONS = {
  ...MAIN_COLLECTIONS,
  ...SOCIAL_COLLECTIONS,
  ...WEB3_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
  ...ANALYTICS_COLLECTIONS,
} as const;

// Type exports for type safety
export type DatabaseId = typeof DATABASE_IDS[keyof typeof DATABASE_IDS];
export type CollectionId = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type BucketId = typeof BUCKET_IDS[keyof typeof BUCKET_IDS];
