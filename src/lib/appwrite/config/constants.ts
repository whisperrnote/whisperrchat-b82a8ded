/**
 * Appwrite Configuration Constants
 * Loaded from environment variables
 */

// Database IDs
export const DATABASE_IDS = {
  MAIN: import.meta.env.VITE_DATABASE_MAIN || 'mainDB',
  SOCIAL: import.meta.env.VITE_DATABASE_SOCIAL || 'socialDB',
  WEB3: import.meta.env.VITE_DATABASE_WEB3 || 'web3DB',
  CONTENT: import.meta.env.VITE_DATABASE_CONTENT || 'contentDB',
  ANALYTICS: import.meta.env.VITE_DATABASE_ANALYTICS || 'analyticsDB',
} as const;

// Collection IDs - Main Database
export const MAIN_COLLECTIONS = {
  PROFILES: import.meta.env.VITE_COLLECTION_PROFILES || 'profiles',
  CONVERSATIONS: import.meta.env.VITE_COLLECTION_CONVERSATIONS || 'conversations',
  MESSAGES: import.meta.env.VITE_COLLECTION_MESSAGES || 'messages',
  MESSAGE_QUEUE: import.meta.env.VITE_COLLECTION_MESSAGE_QUEUE || 'messageQueue',
  CONTACTS: import.meta.env.VITE_COLLECTION_CONTACTS || 'contacts',
  TYPING_INDICATORS: import.meta.env.VITE_COLLECTION_TYPING_INDICATORS || 'typingIndicators',
  PRESENCE: import.meta.env.VITE_COLLECTION_PRESENCE || 'presence',
} as const;

// Collection IDs - Social Database
export const SOCIAL_COLLECTIONS = {
  STORIES: import.meta.env.VITE_COLLECTION_STORIES || 'stories',
  STORY_VIEWS: import.meta.env.VITE_COLLECTION_STORY_VIEWS || 'storyViews',
  POSTS: import.meta.env.VITE_COLLECTION_POSTS || 'posts',
  POST_REACTIONS: import.meta.env.VITE_COLLECTION_POST_REACTIONS || 'postReactions',
  COMMENTS: import.meta.env.VITE_COLLECTION_COMMENTS || 'comments',
  FOLLOWS: import.meta.env.VITE_COLLECTION_FOLLOWS || 'follows',
} as const;

// Collection IDs - Web3 Database
export const WEB3_COLLECTIONS = {
  WALLETS: import.meta.env.VITE_COLLECTION_WALLETS || 'wallets',
  NFTS: import.meta.env.VITE_COLLECTION_NFTS || 'nfts',
  CRYPTO_TRANSACTIONS: import.meta.env.VITE_COLLECTION_CRYPTO_TRANSACTIONS || 'cryptoTransactions',
  TOKEN_GIFTS: import.meta.env.VITE_COLLECTION_TOKEN_GIFTS || 'tokenGifts',
  CONTRACT_HOOKS: import.meta.env.VITE_COLLECTION_CONTRACT_HOOKS || 'contractHooks',
  TOKEN_HOLDINGS: import.meta.env.VITE_COLLECTION_TOKEN_HOLDINGS || 'tokenHoldings',
} as const;

// Collection IDs - Content Database
export const CONTENT_COLLECTIONS = {
  STICKERS: import.meta.env.VITE_COLLECTION_STICKERS || 'stickers',
  STICKER_PACKS: import.meta.env.VITE_COLLECTION_STICKER_PACKS || 'stickerPacks',
  USER_STICKERS: import.meta.env.VITE_COLLECTION_USER_STICKERS || 'userStickers',
  GIFS: import.meta.env.VITE_COLLECTION_GIFS || 'gifs',
  POLLS: import.meta.env.VITE_COLLECTION_POLLS || 'polls',
  AR_FILTERS: import.meta.env.VITE_COLLECTION_AR_FILTERS || 'arFilters',
  MEDIA_LIBRARY: import.meta.env.VITE_COLLECTION_MEDIA_LIBRARY || 'mediaLibrary',
} as const;

// Collection IDs - Analytics Database
export const ANALYTICS_COLLECTIONS = {
  USER_ACTIVITY: import.meta.env.VITE_COLLECTION_USER_ACTIVITY || 'userActivity',
  NOTIFICATIONS: import.meta.env.VITE_COLLECTION_NOTIFICATIONS || 'notifications',
  APP_ANALYTICS: import.meta.env.VITE_COLLECTION_APP_ANALYTICS || 'appAnalytics',
  ERROR_LOGS: import.meta.env.VITE_COLLECTION_ERROR_LOGS || 'errorLogs',
} as const;

// Storage Bucket IDs
export const BUCKET_IDS = {
  AVATARS: import.meta.env.VITE_BUCKET_AVATARS || 'avatars',
  COVERS: import.meta.env.VITE_BUCKET_COVERS || 'covers',
  MESSAGES: import.meta.env.VITE_BUCKET_MESSAGES || 'messages',
  STORIES: import.meta.env.VITE_BUCKET_STORIES || 'stories',
  POSTS: import.meta.env.VITE_BUCKET_POSTS || 'posts',
  NFTS: import.meta.env.VITE_BUCKET_NFTS || 'nfts',
  STICKERS: import.meta.env.VITE_BUCKET_STICKERS || 'stickers',
  FILTERS: import.meta.env.VITE_BUCKET_FILTERS || 'filters',
  GIFS: import.meta.env.VITE_BUCKET_GIFS || 'gifs',
  VOICE: import.meta.env.VITE_BUCKET_VOICE || 'voice',
  VIDEO: import.meta.env.VITE_BUCKET_VIDEO || 'video',
  DOCUMENTS: import.meta.env.VITE_BUCKET_DOCUMENTS || 'documents',
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
