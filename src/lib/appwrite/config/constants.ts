/**
 * Appwrite Configuration Constants
 * Loaded from environment variables
 * 
 * Architecture:
 * - WHISPERRNOTE Database: User management (shared with base app)
 * - CHAT Database: All chat-specific features
 */

// Validate required env vars
const requiredEnvVars = [
  'VITE_APPWRITE_ENDPOINT',
  'VITE_APPWRITE_PROJECT_ID',
  'VITE_DATABASE_WHISPERRNOTE',
  'VITE_DATABASE_CHAT',
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    console.warn(`Missing required environment variable: ${envVar}`);
  }
});

// ============================================
// DATABASE IDS
// ============================================
export const DATABASE_IDS = {
  WHISPERRNOTE: import.meta.env.VITE_DATABASE_WHISPERRNOTE as string,
  CHAT: import.meta.env.VITE_DATABASE_CHAT as string,
} as const;

// ============================================
// COLLECTION IDS - WHISPERRNOTE DATABASE
// ============================================
export const WHISPERRNOTE_COLLECTIONS = {
  USERS: import.meta.env.VITE_COLLECTION_USERS as string,
} as const;

// ============================================
// COLLECTION IDS - CHAT DATABASE
// ============================================
export const CHAT_COLLECTIONS = {
  // Core Chat
  CONVERSATIONS: import.meta.env.VITE_COLLECTION_CONVERSATIONS as string,
  MESSAGES: import.meta.env.VITE_COLLECTION_MESSAGES as string,
  MESSAGE_QUEUE: import.meta.env.VITE_COLLECTION_MESSAGE_QUEUE as string,
  CONTACTS: import.meta.env.VITE_COLLECTION_CONTACTS as string,
  TYPING_INDICATORS: import.meta.env.VITE_COLLECTION_TYPING_INDICATORS as string,
  PRESENCE: import.meta.env.VITE_COLLECTION_PRESENCE as string,
  
  // Social Features
  STORIES: import.meta.env.VITE_COLLECTION_STORIES as string,
  STORY_VIEWS: import.meta.env.VITE_COLLECTION_STORY_VIEWS as string,
  POSTS: import.meta.env.VITE_COLLECTION_POSTS as string,
  FOLLOWS: import.meta.env.VITE_COLLECTION_FOLLOWS as string,
  
  // Web3 Features
  WALLETS: import.meta.env.VITE_COLLECTION_WALLETS as string,
  TOKEN_HOLDINGS: import.meta.env.VITE_COLLECTION_TOKEN_HOLDINGS as string,
  
  // Content Features
  STICKERS: import.meta.env.VITE_COLLECTION_STICKERS as string,
  STICKER_PACKS: import.meta.env.VITE_COLLECTION_STICKER_PACKS as string,
  USER_STICKERS: import.meta.env.VITE_COLLECTION_USER_STICKERS as string,
  GIFS: import.meta.env.VITE_COLLECTION_GIFS as string,
  POLLS: import.meta.env.VITE_COLLECTION_POLLS as string,
  AR_FILTERS: import.meta.env.VITE_COLLECTION_AR_FILTERS as string,
  MEDIA_LIBRARY: import.meta.env.VITE_COLLECTION_MEDIA_LIBRARY as string,
} as const;

// ============================================
// STORAGE BUCKET IDS
// ============================================
export const BUCKET_IDS = {
  COVERS: import.meta.env.VITE_BUCKET_COVERS as string,
  MESSAGES: import.meta.env.VITE_BUCKET_MESSAGES as string,
  STORIES: import.meta.env.VITE_BUCKET_STORIES as string,
  POSTS: import.meta.env.VITE_BUCKET_POSTS as string,
  NFTS: import.meta.env.VITE_BUCKET_NFTS as string,
  STICKERS: import.meta.env.VITE_BUCKET_STICKERS as string,
  FILTERS: import.meta.env.VITE_BUCKET_FILTERS as string,
  GIFS: import.meta.env.VITE_BUCKET_GIFS as string,
  VOICE: import.meta.env.VITE_BUCKET_VOICE as string,
  VIDEO: import.meta.env.VITE_BUCKET_VIDEO as string,
  DOCUMENTS: import.meta.env.VITE_BUCKET_DOCUMENTS as string,
} as const;

// ============================================
// UNIFIED COLLECTIONS (for convenience)
// ============================================
export const COLLECTIONS = {
  ...WHISPERRNOTE_COLLECTIONS,
  ...CHAT_COLLECTIONS,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type DatabaseId = typeof DATABASE_IDS[keyof typeof DATABASE_IDS];
export type CollectionId = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type BucketId = typeof BUCKET_IDS[keyof typeof BUCKET_IDS];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get database ID for a collection
 */
export const getDatabaseForCollection = (collectionId: string): DatabaseId => {
  if (Object.values(WHISPERRNOTE_COLLECTIONS).includes(collectionId as any)) {
    return DATABASE_IDS.WHISPERRNOTE;
  }
  return DATABASE_IDS.CHAT;
};

/**
 * Check if configuration is valid
 */
export const isConfigurationValid = (): boolean => {
  return requiredEnvVars.every((envVar) => Boolean(import.meta.env[envVar]));
};

/**
 * Get all missing environment variables
 */
export const getMissingEnvVars = (): string[] => {
  return requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);
};
