/**
 * Appwrite Configuration
 * Central export for configuration modules
 */

export * from './client';
export * from './constants';

// Re-export for convenience
export { client, account, databases, storage, functions } from './client';
export { DATABASE_IDS, CHAT_COLLECTIONS, WHISPERRNOTE_COLLECTIONS, BUCKET_IDS } from './constants';
