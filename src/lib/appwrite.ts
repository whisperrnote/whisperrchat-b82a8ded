/**
 * Appwrite Integration
 * Central export for all Appwrite functionality
 */

// Export client and core services
export { client, account, tablesDB, storage, functions } from './appwrite/config/client';

// Export constants
export * from './appwrite/config/constants';

// Export service instances
export {
  profileService,
  messagingService,
  socialService,
  web3Service,
  storageService,
  realtimeService,
} from './appwrite/services';

// Export service classes
export {
  ProfileService,
  MessagingService,
  SocialService,
  Web3Service,
  StorageService,
  RealtimeService,
} from './appwrite/services';

// Export types
export type {
  Profiles,
  Conversations,
  Messages,
  Stories,
  Posts,
  Wallets,
  NfTs,
  TokenGifts,
} from '@/types/appwrite.d';

// Legacy alias
export { tablesDB as databases } from './appwrite/config/client';
