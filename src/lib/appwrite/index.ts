/**
 * Appwrite Integration
 * Main export file for Appwrite services and configuration
 */

// Export client and services
export { client, account, databases, storage, functions, isConfigured, getConfig } from './config/client';

// Export constants
export {
  DATABASE_IDS,
  WHISPERRNOTE_COLLECTIONS,
  CHAT_COLLECTIONS,
  BUCKET_IDS,
  COLLECTIONS,
  getDatabaseForCollection,
  isConfigurationValid,
  getMissingEnvVars,
} from './config/constants';

// Export all services
export * from './services';

// Export types
export type { DatabaseId, CollectionId, BucketId } from './config/constants';
export type { User } from './services/user.service';
export type { Conversation, Message } from './services/messaging.service';
export type { Contact } from './services/contacts.service';
