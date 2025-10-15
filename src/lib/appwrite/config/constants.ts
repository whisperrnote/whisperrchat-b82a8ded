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
// Read strictly from env (no hardcoded defaults)
export const DATABASE_IDS = {
  WHISPERRNOTE: import.meta.env.VITE_DATABASE_WHISPERRNOTE as string,
  CHAT: import.meta.env.VITE_DATABASE_CHAT as string,
} as const;

// ============================================
// TABLE IDS - WHISPERRNOTE DATABASE
// ============================================
export const WHISPERRNOTE_TABLES = {
  // Prefer VITE_TABLE_* but support legacy VITE_COLLECTION_* for compatibility
  USERS: (import.meta.env as any).VITE_TABLE_USERS || (import.meta.env as any).VITE_COLLECTION_USERS,
} as const;

// ============================================
// TABLE IDS - CHAT DATABASE
// ============================================
export const CHAT_TABLES = {
  // Core Chat
  CONVERSATIONS: (import.meta.env as any).VITE_TABLE_CONVERSATIONS || (import.meta.env as any).VITE_COLLECTION_CONVERSATIONS,
  MESSAGES: (import.meta.env as any).VITE_TABLE_MESSAGES || (import.meta.env as any).VITE_COLLECTION_MESSAGES,
  MESSAGE_QUEUE: (import.meta.env as any).VITE_TABLE_MESSAGE_QUEUE || (import.meta.env as any).VITE_COLLECTION_MESSAGE_QUEUE,
  CONTACTS: (import.meta.env as any).VITE_TABLE_CONTACTS || (import.meta.env as any).VITE_COLLECTION_CONTACTS,
  TYPING_INDICATORS: (import.meta.env as any).VITE_TABLE_TYPING_INDICATORS || (import.meta.env as any).VITE_COLLECTION_TYPING_INDICATORS,
  PRESENCE: (import.meta.env as any).VITE_TABLE_PRESENCE || (import.meta.env as any).VITE_COLLECTION_PRESENCE,

  // Social Features
  STORIES: (import.meta.env as any).VITE_TABLE_STORIES || (import.meta.env as any).VITE_COLLECTION_STORIES,
  STORY_VIEWS: (import.meta.env as any).VITE_TABLE_STORY_VIEWS || (import.meta.env as any).VITE_COLLECTION_STORY_VIEWS,
  POSTS: (import.meta.env as any).VITE_TABLE_POSTS || (import.meta.env as any).VITE_COLLECTION_POSTS,
  FOLLOWS: (import.meta.env as any).VITE_TABLE_FOLLOWS || (import.meta.env as any).VITE_COLLECTION_FOLLOWS,

  // Web3 Features
  WALLETS: (import.meta.env as any).VITE_TABLE_WALLETS || (import.meta.env as any).VITE_COLLECTION_WALLETS,
  TOKEN_HOLDINGS: (import.meta.env as any).VITE_TABLE_TOKEN_HOLDINGS || (import.meta.env as any).VITE_COLLECTION_TOKEN_HOLDINGS,

  // Content Features
  STICKERS: (import.meta.env as any).VITE_TABLE_STICKERS || (import.meta.env as any).VITE_COLLECTION_STICKERS,
  STICKER_PACKS: (import.meta.env as any).VITE_TABLE_STICKER_PACKS || (import.meta.env as any).VITE_COLLECTION_STICKER_PACKS,
  USER_STICKERS: (import.meta.env as any).VITE_TABLE_USER_STICKERS || (import.meta.env as any).VITE_COLLECTION_USER_STICKERS,
  GIFS: (import.meta.env as any).VITE_TABLE_GIFS || (import.meta.env as any).VITE_COLLECTION_GIFS,
  POLLS: (import.meta.env as any).VITE_TABLE_POLLS || (import.meta.env as any).VITE_COLLECTION_POLLS,
  AR_FILTERS: (import.meta.env as any).VITE_TABLE_AR_FILTERS || (import.meta.env as any).VITE_COLLECTION_AR_FILTERS,
  MEDIA_LIBRARY: (import.meta.env as any).VITE_TABLE_MEDIA_LIBRARY || (import.meta.env as any).VITE_COLLECTION_MEDIA_LIBRARY,
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
// UNIFIED TABLES (for convenience)
// ============================================
export const TABLES = {
  ...WHISPERRNOTE_TABLES,
  ...CHAT_TABLES,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type DatabaseId = typeof DATABASE_IDS[keyof typeof DATABASE_IDS];
export type TableId = typeof TABLES[keyof typeof TABLES];
export type BucketId = typeof BUCKET_IDS[keyof typeof BUCKET_IDS];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get database ID for a table
 */
export const getDatabaseForTable = (tableId: string): DatabaseId => {
  if (Object.values(WHISPERRNOTE_TABLES).includes(tableId as any)) {
    return DATABASE_IDS.WHISPERRNOTE;
  }
  return DATABASE_IDS.CHAT;
};

// ---------------------------------------------------------------------------
// Backward-compatibility exports (Collections terminology)
// ---------------------------------------------------------------------------
export const WHISPERRNOTE_COLLECTIONS = WHISPERRNOTE_TABLES;
export const CHAT_COLLECTIONS = CHAT_TABLES;
export const COLLECTIONS = TABLES;
export type CollectionId = TableId;
export const getDatabaseForCollection = getDatabaseForTable;

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
