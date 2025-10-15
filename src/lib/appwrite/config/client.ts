/**
 * Appwrite Client Configuration
 * Initialized with environment variables
 */

import { Client, Account, Databases, Storage, Functions, TablesDB } from 'appwrite';

// Get environment variables
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;

// Validate configuration
if (!ENDPOINT) {
  console.error('VITE_APPWRITE_ENDPOINT is not set. Please configure your environment variables.');
}

if (!PROJECT_ID) {
  console.error('VITE_APPWRITE_PROJECT_ID is not set. Please configure your environment variables.');
}

/**
 * Initialize Appwrite Client
 */
export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

/**
 * Service Instances
 */
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
// New: TablesDB client for Appwrite Tables service
export const tablesDB = new TablesDB(client);

/**
 * Export client for advanced usage
 */
export { Client };

/**
 * Helper to check if Appwrite is configured
 */
export const isConfigured = (): boolean => {
  return Boolean(ENDPOINT && PROJECT_ID);
};

/**
 * Helper to get current configuration (without sensitive data)
 */
export const getConfig = () => ({
  endpoint: ENDPOINT,
  projectId: PROJECT_ID ? `${PROJECT_ID.substring(0, 8)}...` : 'NOT_SET',
  configured: isConfigured(),
});
